"use client";

import type { DesktopInstance } from "@/app/build-sensepc/types";

import { useGetUsersQuery } from "@/api/user";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  useAssignPCMutation,
  useUnassignPCMutation,
  useLazyGetAssignmentsQuery,
} from "@/api/assignpc";

import { cn } from "@/lib/utils/index";
import { Logger } from "@/lib/utils/logger";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
  Search,
  UserPlus,
  UserMinus,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";

type ApiUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "member";
  status?: string;
};

type AssignUserDialogProps = {
  open: boolean;
  onClose: () => void;
  pc: DesktopInstance | null;
  onSuccess: () => void;
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
        inline-flex h-10 min-w-0 flex-1 items-center justify-center
        rounded-full border border-zinc-300/70 bg-white/80 px-3 py-1.5
        text-center text-xs font-medium leading-tight text-zinc-900 shadow-sm
        dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100
      "
    >
      <span className="block truncate text-center leading-tight">{children}</span>
    </div>
  );
}

const AssignUserDialog: React.FC<AssignUserDialogProps> = ({
  open,
  onClose,
  pc,
  onSuccess,
}) => {
  const [assignments, setAssignments] = useState<
    Record<string, { instanceId: string }[]>
  >({});
  const [query, setQuery] = useState("");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [loadingUnassign, setLoadingUnassign] = useState(false);
  const [assignPC] = useAssignPCMutation();
  const [unassignPC] = useUnassignPCMutation();
  const [triggerGetAssignments] = useLazyGetAssignmentsQuery();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    | { type: "assign"; user: ApiUser }
    | { type: "unassign" }
    | { type: "blocked"; message: string }
    | null
  >(null);

  const { data, isLoading } = useGetUsersQuery(undefined, {
    skip: !open,
  });

  const users: ApiUser[] = useMemo(() => data?.users ?? [], [data?.users]);

  const fetchAssignments = useCallback(async () => {
    try {
      const a = await triggerGetAssignments().unwrap();
      setAssignments(a || {});
    } catch {
      // Intentionally ignored
    }
  }, [triggerGetAssignments]);

  const assignedUser: ApiUser | null = useMemo(() => {
    if (!pc || !assignments) return null;

    for (const uid in assignments) {
      const arr = assignments[uid];
      if (
        Array.isArray(arr) &&
        arr.some((a) => a.instanceId === pc.instanceId)
      ) {
        return users.find((u) => u.id === uid) || null;
      }
    }
    return null;
  }, [pc, assignments, users]);

  const memberUsers = useMemo(
    () => users.filter((u) => u.role === "member"),
    [users],
  );

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return memberUsers;

    return memberUsers.filter((u) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`
        .trim()
        .toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [memberUsers, query]);

  useEffect(() => {
    if (open) {
      fetchAssignments();
      setQuery("");
    }
  }, [open, fetchAssignments]);

  const titleName = pc?.systemName?.trim() || pc?.instanceId || "Sense PC";
  const pcState = pc?.state?.toLowerCase();
  const isStopped = pcState === "stopped";
  const isRunning = pcState === "running";
  const isTransitioning = !!pcState && !isStopped && !isRunning;
  const canAssign = isStopped;
  const isUnassigned = !assignedUser;

  const memberLabel = (u: ApiUser) => {
    const full = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return full || u.email;
  };

  const initials = (u: ApiUser) => {
    const a = (u.firstName?.[0] || "").toUpperCase();
    const b = (u.lastName?.[0] || "").toUpperCase();
    if (a || b) return `${a}${b}`.trim();
    return (u.email?.[0] || "U").toUpperCase();
  };

  const assignToMember = async (user: ApiUser) => {
    if (!pc) return;

    if (isTransitioning) {
      setConfirmAction({
        type: "blocked",
        message:
          "This PC is currently changing state. Please wait until it finishes before continuing.",
      });
      setConfirmOpen(true);
      return;
    }

    if (isRunning && isUnassigned) {
      setConfirmAction({
        type: "blocked",
        message: "This PC is running. Please stop it before assigning access.",
      });
      setConfirmOpen(true);
      return;
    }

    if (!canAssign) {
      setConfirmAction({ type: "assign", user });
      setConfirmOpen(true);
      return;
    }

    await assignToMemberDirect(user);
  };

  const assignToMemberDirect = async (user: ApiUser) => {
    if (!pc) return;
    setLoadingUserId(user.id);

    if (assignedUser && assignedUser.id !== user.id) {
      try {
        await unassignPC({
          instanceId: pc.instanceId,
          memberId: assignedUser.id,
        }).unwrap();
      } catch (e) {
        Logger.error("Failed to unassign before assigning:", e);
        toast({
          title: "Failed to update access",
          description:
            "The current assignment could not be removed before assigning the new member.",
          variant: "destructive",
        });
        setLoadingUserId(null);
        return;
      }
    }

    try {
      await assignPC({
        instanceId: pc.instanceId,
        memberId: user.id,
        systemName: pc.systemName || "",
      }).unwrap();
      toast({
        title: "Access updated",
        description: `${pc.systemName} is now assigned to ${
          user.firstName || user.email
        }.`,
      });
      onSuccess();
      closeDialog();
    } catch (e) {
      toast({
        title: "Failed to assign access",
        variant: "destructive",
        description: getErrorMessage(e),
      });
    } finally {
      setLoadingUserId(null);
    }
  };

  const unassign = async () => {
    if (!pc || !assignedUser) return;

    if (isTransitioning) {
      setConfirmAction({
        type: "blocked",
        message:
          "This PC is currently changing state. Please wait until it finishes before continuing.",
      });
      setConfirmOpen(true);
      return;
    }

    if (!canAssign) {
      setConfirmAction({ type: "unassign" });
      setConfirmOpen(true);
      return;
    }

    await unassignDirect();
  };

  const unassignDirect = async () => {
    if (!pc || !assignedUser) return;
    setLoadingUnassign(true);

    try {
      await unassignPC({
        instanceId: pc.instanceId,
        memberId: assignedUser.id,
      }).unwrap();
      toast({
        title: "Access removed",
        description: `${pc.systemName} is now unassigned.`,
      });
      onSuccess();
      closeDialog();
    } catch (e) {
      toast({
        title: "Failed to remove access",
        variant: "destructive",
        description: getErrorMessage(e),
      });
    } finally {
      setLoadingUnassign(false);
    }
  };

  const closeDialog = useCallback(() => {
    onClose();
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [onClose]);

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
        ? "This PC is not currently stopped. Continue updating the member assignment for this computer?"
        : "This PC is not currently stopped. Continue removing the current member assignment?";

  const handleConfirm = async () => {
    if (!confirmAction) return;

    setConfirmOpen(false);
    const action = confirmAction;
    setConfirmAction(null);

    if (action.type === "blocked") return;

    if (action.type === "assign") {
      await assignToMemberDirect(action.user);
    } else {
      await unassignDirect();
    }
  };

  const stateBadgeClass = isStopped
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40"
    : isRunning
      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40"
      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40";

  const showGuidance = isTransitioning || isRunning || !canAssign;
  const isBusy = isLoading || loadingUnassign || loadingUserId !== null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeDialog();
        }}
      >
        <DialogContent
          data-testid="sensepc-assign-modal"
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
                        Assign or update member access for{" "}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {titleName}
                        </span>
                        .
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("rounded-full px-3 py-1 font-medium", stateBadgeClass)}
                        >
                          {pc?.state || "Unknown state"}
                        </Badge>

                        <Badge
                          variant={assignedUser ? "default" : "secondary"}
                          className="rounded-full px-3 py-1"
                        >
                          {assignedUser ? "Assigned" : "Unassigned"}
                        </Badge>

                        {assignedUser && (
                          <Badge
                            variant="outline"
                            className="rounded-full px-3 py-1"
                            data-testid="sensepc-assigned-user-indicator"
                          >
                            {memberLabel(assignedUser)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard
                    icon={<UserCheck className="h-4 w-4" />}
                    title="Current access"
                    description={
                      assignedUser
                        ? `Assigned to ${memberLabel(assignedUser)}.`
                        : "No active assignment."
                    }
                  />
                  <InfoCard
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="Assignment guidance"
                    description="Stop the PC before updating access."
                  />
                  <InfoCard
                    icon={<Users className="h-4 w-4" />}
                    title="Member directory"
                    description="Search by name or email and assign access."
                  />
                </div>

                <div className="rounded-2xl border border-zinc-300/60 bg-white/65 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/55">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Current access
                      </p>

                      {assignedUser ? (
                        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          This PC is currently assigned to{" "}
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {memberLabel(assignedUser)}
                          </span>
                          .
                        </p>
                      ) : (
                        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          No member currently has access to this PC.
                        </p>
                      )}

                      {assignedUser && isRunning && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Changing access while the PC is running may interrupt the current session.
                        </p>
                      )}
                    </div>

                    {assignedUser ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer rounded-full border-zinc-300/60 bg-white/80 text-zinc-900 hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
                        onClick={unassign}
                        disabled={loadingUnassign || loadingUserId !== null}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        {loadingUnassign ? "Removing..." : "Remove Access"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer rounded-full border-zinc-300/60 bg-white/80 text-zinc-900 hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
                        onClick={() => {
                          const el = document.getElementById("sensepc-member-search");
                          el?.focus?.();
                        }}
                        disabled={isBusy}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Select Member
                      </Button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-300/60 bg-white/65 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/55">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      Access update flow
                    </p>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                      Choose a member, confirm the action when required, and SensePC will update access for this computer.
                    </p>
                  </div>

                  <div className="mt-4 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
                    <StepPill>Select Member</StepPill>
                    <ArrowRight className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                    <StepPill>Access Updated</StepPill>
                    <ArrowRight className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                    <StepPill>Member Use PC</StepPill>
                  </div>
                </div>

                {showGuidance && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          Attention
                        </p>

                        {isTransitioning ? (
                          <p className="mt-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                            This PC is currently changing state. Wait until the state change completes before updating access.
                          </p>
                        ) : isRunning && isUnassigned ? (
                          <p className="mt-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                            This PC is running. Stop it before assigning access to a member.
                          </p>
                        ) : assignedUser ? (
                          <p className="mt-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                            Updating access for a PC with an active assignment may affect the current user experience.
                          </p>
                        ) : (
                          <p className="mt-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                            This PC is not currently in a stopped state. For best results, stop it before continuing.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                      <p
                        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                        data-testid="sensepc-assign-to-member-label"
                      >
                        Assign to member
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        Search by name or email, then assign access directly from the member list.
                      </p>
                    </div>

                    <div className="relative w-full md:max-w-[320px]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        id="sensepc-member-search"
                        uiSize="form"
                        placeholder="Search members..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="rounded-2xl border border-zinc-300/60 p-4 text-sm text-zinc-600 dark:border-zinc-700/60 dark:text-zinc-300">
                      Loading members...
                    </div>
                  ) : (
                    <div className="grid gap-2" data-testid="sensepc-member-list">
                      {filteredMembers.length === 0 && (
                        <div className="rounded-2xl border border-zinc-300/60 p-4 text-sm text-zinc-600 dark:border-zinc-700/60 dark:text-zinc-300">
                          No members found.
                        </div>
                      )}

                      {filteredMembers.map((u) => {
                        const already = !!assignedUser && assignedUser.id === u.id;
                        const name = memberLabel(u);
                        const isRowLoading = loadingUserId === u.id;

                        return (
                          <div
                            key={u.id}
                            data-testid="sensepc-member-item"
                            className={cn(
                              "group rounded-2xl border border-zinc-300/60 p-4 transition-all",
                              "bg-white/70 hover:border-violet-300/50 hover:bg-violet-50/50",
                              "dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:hover:border-violet-500/30 dark:hover:bg-violet-950/10",
                            )}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0 flex items-center gap-3">
                                <div
                                  className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                                    "border-violet-200 bg-violet-500/[0.08] text-violet-600",
                                    "dark:border-violet-900/40 dark:text-violet-300",
                                  )}
                                  aria-hidden
                                >
                                  <span className="text-sm font-semibold">
                                    {initials(u)}
                                  </span>
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {name}
                                  </p>
                                  <p className="truncate text-xs text-zinc-600 dark:text-zinc-300">
                                    {u.email}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {already && (
                                  <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                  >
                                    Current
                                  </Badge>
                                )}

                                <Button
                                  disabled={already || isRowLoading || loadingUnassign}
                                  variant={already ? "secondary" : "default"}
                                  size="sm"
                                  className={cn(
                                    "rounded-full",
                                    !already &&
                                      "cursor-pointer bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_55%,#C026D3_100%)] text-white shadow-[0_10px_30px_-12px_rgba(124,58,237,0.55)] hover:opacity-95",
                                  )}
                                  onClick={() => assignToMember(u)}
                                  data-testid="sensepc-assign-confirm-button"
                                >
                                  {already ? (
                                    "Already Assigned"
                                  ) : isRowLoading ? (
                                    "Assigning..."
                                  ) : (
                                    <>
                                      <UserPlus className="mr-2 h-4 w-4" />
                                      Assign
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
                </div>
              </div>
            </div>

            <Separator />

            <DialogFooter className="shrink-0 px-6 py-4">
              <Button
                onClick={closeDialog}
                variant="outline"
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

export default AssignUserDialog;