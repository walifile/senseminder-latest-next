"use client";

import { useDeleteUserMutation } from "@/api/user";
import { useLazyGetAssignmentsQuery } from "@/api/assignpc";
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  UserX,
  Trash2,
  Monitor,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";

import type { ApiUser } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedUser: ApiUser | null;
  setSelectedUser: (user: ApiUser | null) => void;
  globalReload: () => void;
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

const DeleteUserDialog = ({
  open,
  onClose,
  selectedUser,
  setSelectedUser,
  globalReload,
}: Props) => {
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [assignments, setAssignments] = useState<
    Record<string, { instanceId: string }[]>
  >({});

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [triggerGetAssignments, { isFetching: isFetchingAssignments }] =
    useLazyGetAssignmentsQuery();

  const email = selectedUser?.email || "";
  const role = selectedUser?.role || "";
  const selectedUserId = selectedUser?.id || "";

  const selectedUserName = useMemo(() => {
    if (!selectedUser) return "this user";
    const full = `${selectedUser.firstName || ""} ${
      selectedUser.lastName || ""
    }`
      .trim()
      .replace(/\s+/g, " ");
    return full || selectedUser.email;
  }, [selectedUser]);

  useEffect(() => {
    let isMounted = true;

    const fetchAssignments = async () => {
      if (!open) return;

      try {
        const result = await triggerGetAssignments().unwrap();
        if (isMounted) {
          setAssignments(result || {});
        }
      } catch {
        if (isMounted) {
          setAssignments({});
        }
      }
    };

    fetchAssignments();

    return () => {
      isMounted = false;
    };
  }, [open, triggerGetAssignments]);

  const assignedPcCount = useMemo(() => {
    if (!selectedUserId) return 0;
    const list = assignments[selectedUserId];
    return Array.isArray(list) ? list.length : 0;
  }, [assignments, selectedUserId]);

  const hasAssignedPCs = assignedPcCount > 0;
  const canDelete =
    deleteConfirmInput.trim().toLowerCase() === "confirm" &&
    !hasAssignedPCs &&
    !isFetchingAssignments;

  const closeDialog = useCallback(() => {
    if (isDeleting) return;
    setDeleteConfirmInput("");
    setAssignments({});
    setSelectedUser(null);
    onClose();
  }, [isDeleting, onClose, setSelectedUser]);

  const handleDeleteUser = async () => {
    if (!email || !role) return;

    if (isFetchingAssignments) {
      toast({
        title: "Checking assignments",
        description: "Please wait while we verify whether this user has assigned PCs.",
      });
      return;
    }

    if (hasAssignedPCs) {
      toast({
        title: "User cannot be deleted",
        description:
          assignedPcCount === 1
            ? "This user still has 1 assigned PC. Remove the assignment before deleting the user."
            : `This user still has ${assignedPcCount} assigned PCs. Remove all assignments before deleting the user.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteUser({ email, role }).unwrap();

      toast({
        title: "User deleted",
        description: `The user ${email} has been deleted.`,
      });

      globalReload();
      closeDialog();
    } catch (e) {
      toast({
        title: "Failed to delete user",
        variant: "destructive",
        description: getErrorMessage(e, "Failed to delete user."),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
    >
      <DialogContent
        data-testid="dashboard-users-delete-dialog"
        className="w-[min(92vw,44rem)] max-w-xl gap-0 overflow-hidden rounded-2xl border-zinc-300/60 p-0 dark:border-zinc-700/60"
      >
        <div className="flex max-h-[calc(100vh-2.5rem)] flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-zinc-300/50 px-6 pb-5 pt-6 dark:border-zinc-700/50">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(220,38,38,0.12)_0%,rgba(220,38,38,0.18)_100%)] ring-1 ring-inset ring-red-300/40 dark:ring-red-500/25">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-left text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Delete User
                </DialogTitle>

                <DialogDescription asChild>
                  <div className="mt-2 space-y-3 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                    <p>
                      You are about to permanently delete{" "}
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUserName}
                      </span>
                      .
                    </p>

                    {email && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        {email}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={hasAssignedPCs ? "destructive" : "secondary"}
                        className="rounded-full px-3 py-1"
                      >
                        {isFetchingAssignments
                          ? "Checking assignments..."
                          : hasAssignedPCs
                            ? `${assignedPcCount} assigned PC${assignedPcCount === 1 ? "" : "s"}`
                            : "No assigned PCs"}
                      </Badge>
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
                  icon={<ShieldAlert className="h-4 w-4" />}
                  title="Permanent action"
                  description="This user will be deleted permanently."
                />
                <InfoCard
                  icon={<UserX className="h-4 w-4" />}
                  title="Access removed"
                  description="The user will lose workspace access."
                />
                <InfoCard
                  icon={<Monitor className="h-4 w-4" />}
                  title="Assignment rule"
                  description="Unassign all PCs before deleting this user."
                />
              </div>

              <div className="rounded-2xl border border-zinc-300/60 bg-white/65 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/55">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                    Deletion flow
                  </p>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                    Remove any assigned PCs first, then confirm the deletion request.
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <StepPill>Unassign PCs</StepPill>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                  <StepPill>Type confirm</StepPill>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                  <StepPill>Delete user</StepPill>
                </div>
              </div>

              {hasAssignedPCs ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Action unavailable
                  </p>
                  <p className="mt-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                    This user currently has{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {assignedPcCount} assigned PC{assignedPcCount === 1 ? "" : "s"}
                    </span>
                    . Remove all assigned PCs before deleting the user.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Important
                  </p>
                  <p className="mt-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                    This action is irreversible. To continue, type{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      confirm
                    </span>{" "}
                    in the field below.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="delete-user-confirm-input"
                  className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Confirmation
                </label>

                <Input
                  id="delete-user-confirm-input"
                  placeholder={
                    hasAssignedPCs
                      ? "Remove assigned PCs before deletion"
                      : 'Type "confirm" to proceed'
                  }
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  disabled={isDeleting || hasAssignedPCs || isFetchingAssignments}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-zinc-300/50 px-6 py-4 sm:justify-end dark:border-zinc-700/50">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isDeleting}
              className="border-zinc-300/60 bg-white/75 text-zinc-900 transition-all hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={!canDelete || isDeleting}
              className="shadow-sm"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;