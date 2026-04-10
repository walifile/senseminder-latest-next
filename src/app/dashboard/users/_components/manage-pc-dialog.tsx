"use client";

import type { PC } from "@/app/build-sensepc/types";

import React, { useMemo, useState, useCallback } from "react";
import { useListRemoteDesktopQuery } from "@/api/fileManagerAPI";
import { useAssignPCMutation, useUnassignPCMutation } from "@/api/assignpc";

import { cn } from "@/lib/utils/index";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";

import type { ApiUser } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedUser: ApiUser | null;
  setSelectedUser: (user: ApiUser | null) => void;
  globalReload: () => void;
  fetchAssignmentsLoading: boolean;
  assignments: Record<string, { instanceId: string }[]>;
};

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-300/60 bg-white/70 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/60">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        inline-flex h-12 w-[170px] shrink-0 items-center justify-center
        rounded-full border border-zinc-300/70 bg-white/80 px-4 py-2
        text-center text-sm font-medium leading-tight text-zinc-900 shadow-sm
        dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100
      "
    >
      <span className="block text-center leading-tight">{children}</span>
    </div>
  );
}

const ManagePcDialog = ({
  open,
  onClose,
  selectedUser,
  setSelectedUser,
  globalReload,
  fetchAssignmentsLoading,
  assignments,
}: Props) => {
  const [pcAssigningId, setPCAssigningId] = useState<string | null>(null);
  const [assignPC] = useAssignPCMutation();
  const [unassignPC] = useUnassignPCMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    | { type: "assign"; pc: PC }
    | { type: "unassign"; pc: PC }
    | { type: "blocked"; message: string }
    | null
  >(null);

  const { data: smartPCs = [], isLoading: isSmartPCLoading } =
    useListRemoteDesktopQuery(
      selectedUser
        ? { userId: selectedUser.owner_id || selectedUser.id }
        : { userId: undefined },
      { skip: !selectedUser },
    );

  const pcs: PC[] = useMemo(
    () => (Array.isArray(smartPCs) ? (smartPCs as PC[]) : []),
    [smartPCs],
  );

  const isLoading = fetchAssignmentsLoading || isSmartPCLoading;
  const isMutating = pcAssigningId !== null;

  const getAssignedUserId = useCallback(
    (instanceId: string) => {
      const match = Object.entries(assignments).find(([, list]) =>
        list.some((assignment) => assignment.instanceId === instanceId),
      );
      return match ? match[0] : null;
    },
    [assignments],
  );

  const isAssignedToAny = useCallback(
    (instanceId: string) =>
      Object.values(assignments).some((list) =>
        list.some((assignment) => assignment.instanceId === instanceId),
      ),
    [assignments],
  );

  const selectedUserName = useMemo(() => {
    if (!selectedUser) return "Selected member";
    const full = `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim();
    return full || selectedUser.email;
  }, [selectedUser]);

  const assignedPcCount = useMemo(() => {
    if (!selectedUser) return 0;
    return pcs.filter((pc: PC) => getAssignedUserId(pc.instanceId) === selectedUser.id)
      .length;
  }, [pcs, selectedUser, getAssignedUserId]);

  const closeDialog = useCallback(() => {
    if (isMutating) return;
    setSelectedUser(null);
    onClose();
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [isMutating, onClose, setSelectedUser]);

  const assignSmartPC = async (instance: PC) => {
    if (!selectedUser) return;

    const state = instance.state?.toLowerCase();
    if (state && state !== "stopped" && state !== "running") {
      setConfirmAction({
        type: "blocked",
        message:
          "This PC is currently changing state. Please wait until it finishes before continuing.",
      });
      setConfirmOpen(true);
      return;
    }

    if (state === "running" && !isAssignedToAny(instance.instanceId)) {
      setConfirmAction({
        type: "blocked",
        message: "This PC is running. Please stop it before assigning access.",
      });
      setConfirmOpen(true);
      return;
    }

    if (state !== "stopped") {
      setConfirmAction({ type: "assign", pc: instance });
      setConfirmOpen(true);
      return;
    }

    await assignSmartPCDirect(instance);
  };

  const assignSmartPCDirect = async (instance: PC) => {
    if (!selectedUser) return;

    setPCAssigningId(instance.instanceId);
    try {
      await assignPC({
        memberId: selectedUser.id,
        instanceId: instance.instanceId,
        systemName: instance.systemName,
      }).unwrap();

      toast({
        title: "PC Assigned",
        description: `${instance.systemName} assigned to ${
          selectedUser.firstName || selectedUser.email
        }`,
      });

      setTimeout(globalReload, 300);
    } catch (e) {
      toast({
        title: "Failed to assign PC",
        variant: "destructive",
        description: getErrorMessage(e, "Failed to assign"),
      });
    } finally {
      setPCAssigningId(null);
    }
  };

  const unassignSmartPC = async (instance: PC) => {
    if (!selectedUser) return;

    const state = instance.state?.toLowerCase();
    if (state && state !== "stopped" && state !== "running") {
      setConfirmAction({
        type: "blocked",
        message:
          "This PC is currently changing state. Please wait until it finishes before continuing.",
      });
      setConfirmOpen(true);
      return;
    }

    if (state !== "stopped") {
      setConfirmAction({ type: "unassign", pc: instance });
      setConfirmOpen(true);
      return;
    }

    await unassignSmartPCDirect(instance);
  };

  const unassignSmartPCDirect = async (instance: PC) => {
    if (!selectedUser) return;

    setPCAssigningId(instance.instanceId);
    try {
      await unassignPC({
        memberId: selectedUser.id,
        instanceId: instance.instanceId,
      }).unwrap();

      toast({
        title: "PC Unassigned",
        description: `${instance.systemName} unassigned from ${
          selectedUser.firstName || selectedUser.email
        }`,
      });

      setTimeout(globalReload, 300);
    } catch (e) {
      toast({
        title: "Failed to unassign PC",
        variant: "destructive",
        description: getErrorMessage(e, "Failed to unassign"),
      });
    } finally {
      setPCAssigningId(null);
    }
  };

  const confirmTitle =
    confirmAction?.type === "blocked"
      ? "Action unavailable"
      : confirmAction?.type === "assign"
        ? "Confirm access change"
        : "Confirm unassign";

  const confirmDescription =
    confirmAction?.type === "blocked"
      ? confirmAction.message
      : confirmAction?.type === "assign"
        ? "This PC is not currently stopped. Continue updating member access for this computer?"
        : "This PC is not currently stopped. Continue removing member access for this computer?";

  const handleConfirm = async () => {
    if (!confirmAction) return;

    setConfirmOpen(false);
    const action = confirmAction;
    setConfirmAction(null);

    if (action.type === "blocked") return;

    if (action.type === "assign") {
      await assignSmartPCDirect(action.pc);
    } else {
      await unassignSmartPCDirect(action.pc);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeDialog();
        }}
      >
        <DialogContent
          data-testid="dashboard-users-manage-pc-dialog"
          className="w-[min(92vw,48rem)] max-w-2xl gap-0 overflow-hidden rounded-2xl border-zinc-300/60 p-0 dark:border-zinc-700/60"
        >
          <div className="flex max-h-[calc(100vh-2.5rem)] flex-col overflow-hidden">
            <DialogHeader className="shrink-0 border-b border-zinc-300/50 px-6 pb-5 pt-6 dark:border-zinc-700/50">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(79,70,229,0.12)_0%,rgba(124,58,237,0.18)_100%)] ring-1 ring-inset ring-violet-300/40 dark:ring-violet-500/25">
                  <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>

                <div className="min-w-0">
                  <DialogTitle className="text-left text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Manage Sense PC Access
                  </DialogTitle>

                  <DialogDescription asChild>
                    <div className="mt-2 space-y-3 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                      <p>
                        Assign or remove Sense PC access for{" "}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {selectedUserName}
                        </span>
                        .
                      </p>

                      {selectedUser?.email && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300">
                          {selectedUser.email}
                        </p>
                      )}
                    </div>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                {!selectedUser ? (
                  <div className="rounded-2xl border border-zinc-300/60 p-4 text-sm text-zinc-600 dark:border-zinc-700/60 dark:text-zinc-300">
                    No user selected.
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <InfoCard
                        icon={<UserCheck className="h-4 w-4" />}
                        title="Selected member"
                        description={`${selectedUserName} is the member currently being managed.`}
                      />
                      <InfoCard
                        icon={<ShieldCheck className="h-4 w-4" />}
                        title="Assignment guidance"
                        description="For the most predictable access changes, stop the PC before assigning or removing a member."
                      />
                      <InfoCard
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        title="Assigned PCs"
                        description={`${assignedPcCount} PC${assignedPcCount === 1 ? "" : "s"} currently assigned to this member in this list.`}
                      />
                    </div>

                    <div className="rounded-2xl border border-zinc-300/60 bg-white/65 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/55">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                          Access update flow
                        </p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                          Review available PCs, update the assignment, and SensePC will apply the member access change.
                        </p>
                      </div>

                      <div className="mt-4 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
                        <StepPill>Select PC</StepPill>
                        <ArrowRight className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                        <StepPill>Access Updated</StepPill>
                        <ArrowRight className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                        <StepPill>Member Can Use PC</StepPill>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="rounded-2xl border border-zinc-300/60 p-4 text-sm text-zinc-600 dark:border-zinc-700/60 dark:text-zinc-300">
                        Loading PCs...
                      </div>
                    ) : pcs.length === 0 ? (
                      <div className="rounded-2xl border border-zinc-300/60 p-4 text-sm text-zinc-600 dark:border-zinc-700/60 dark:text-zinc-300">
                        No PCs available to assign.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pcs.map((pc: PC) => {
                          const assignedUserId = getAssignedUserId(pc.instanceId);
                          const assignedToSelectedUser =
                            !!selectedUser && assignedUserId === selectedUser.id;
                          const assignedToAnotherUser =
                            !!assignedUserId &&
                            !!selectedUser &&
                            assignedUserId !== selectedUser.id;

                          const state = pc.state?.toLowerCase() || "";
                          const isTransitioning =
                            !!state && state !== "stopped" && state !== "running";
                          const isRowLoading = pcAssigningId === pc.instanceId;

                          const stateBadgeClass =
                            state === "stopped"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40"
                              : state === "running"
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40";

                          const assignmentBadgeClass = assignedToSelectedUser
                            ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-900/40"
                            : assignedToAnotherUser
                              ? "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-200 dark:border-zinc-700"
                              : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-zinc-700/60";

                          const buttonLabel = assignedToSelectedUser
                            ? isRowLoading
                              ? "Removing..."
                              : "Remove Access"
                            : assignedToAnotherUser
                              ? "Assigned"
                              : isRowLoading
                                ? "Assigning..."
                                : "Assign";

                          return (
                            <div
                              key={pc.instanceId}
                              className={cn(
                                "group rounded-2xl border border-zinc-300/60 p-4 transition-all",
                                "bg-white/70 hover:border-violet-300/50 hover:bg-violet-50/50",
                                "dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:hover:border-violet-500/30 dark:hover:bg-violet-950/10",
                              )}
                            >
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                      {pc.systemName || "Unnamed PC"}
                                    </p>

                                    <Badge
                                      variant="outline"
                                      className={cn("rounded-full px-3 py-1 font-medium", stateBadgeClass)}
                                    >
                                      {pc.state || "Unknown state"}
                                    </Badge>

                                    <Badge
                                      variant="outline"
                                      className={cn("rounded-full px-3 py-1 font-medium", assignmentBadgeClass)}
                                    >
                                      {assignedToSelectedUser
                                        ? "Assigned to selected member"
                                        : assignedToAnotherUser
                                          ? "Assigned to another member"
                                          : "Unassigned"}
                                    </Badge>
                                  </div>

                                  <div className="mt-2 space-y-1">
                                    {isTransitioning && (
                                      <p className="text-xs text-amber-700 dark:text-amber-300">
                                        This PC is currently changing state.
                                      </p>
                                    )}

                                    {state === "running" &&
                                      !assignedToSelectedUser &&
                                      !assignedToAnotherUser && (
                                        <p className="text-xs text-amber-700 dark:text-amber-300">
                                          Stop this PC before assigning access.
                                        </p>
                                      )}
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  <Button
                                    size="sm"
                                    disabled={assignedToAnotherUser || isRowLoading || isMutating}
                                    variant={assignedToSelectedUser ? "outline" : "default"}
                                    className={cn(
                                      "rounded-full",
                                      assignedToSelectedUser &&
                                        "border-zinc-300/60 bg-white/80 text-zinc-900 hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900",
                                      !assignedToSelectedUser &&
                                        !assignedToAnotherUser &&
                                        "bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_55%,#C026D3_100%)] text-white shadow-[0_10px_30px_-12px_rgba(124,58,237,0.55)] hover:opacity-95",
                                    )}
                                    onClick={() =>
                                      assignedToSelectedUser
                                        ? unassignSmartPC(pc)
                                        : assignSmartPC(pc)
                                    }
                                  >
                                    {assignedToSelectedUser ? (
                                      <>
                                        <UserMinus className="mr-2 h-4 w-4" />
                                        {buttonLabel}
                                      </>
                                    ) : (
                                      <>
                                        {!assignedToAnotherUser && (
                                          <UserPlus className="mr-2 h-4 w-4" />
                                        )}
                                        {buttonLabel}
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <Separator />

            <DialogFooter className="shrink-0 px-6 py-4">
              <Button
                onClick={closeDialog}
                variant="outline"
                disabled={isMutating}
                className="cursor-pointer rounded-full border-zinc-300/60 bg-white/75 text-zinc-900 hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmOpen(false);
            setConfirmAction(null);
          }
        }}
      >
        <DialogContent className="w-[min(92vw,32rem)] max-w-md gap-0 overflow-hidden rounded-2xl border-zinc-300/60 p-0 dark:border-zinc-700/60">
          <div className="flex max-h-[calc(100vh-2.5rem)] flex-col overflow-hidden">
            <DialogHeader className="shrink-0 border-b border-zinc-300/50 px-6 pb-5 pt-6 dark:border-zinc-700/50">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(245,158,11,0.12)_0%,rgba(245,158,11,0.18)_100%)] ring-1 ring-inset ring-amber-300/40 dark:ring-amber-500/25">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="min-w-0">
                  <DialogTitle className="text-left text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {confirmTitle}
                  </DialogTitle>

                  <DialogDescription className="mt-2 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                    {confirmDescription}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogFooter className="shrink-0 border-t border-zinc-300/50 px-6 py-4 sm:justify-end dark:border-zinc-700/50">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmAction(null);
                }}
                className="cursor-pointer border-zinc-300/60 bg-white/75 text-zinc-900 hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                {confirmAction?.type === "blocked" ? "Close" : "Cancel"}
              </Button>

              {confirmAction?.type !== "blocked" && (
                <Button
                  onClick={handleConfirm}
                  className="cursor-pointer bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_55%,#C026D3_100%)] text-white hover:opacity-95"
                >
                  Continue
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManagePcDialog;