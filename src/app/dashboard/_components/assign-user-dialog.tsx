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
} from "@/components/ui/dialog";

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

// Shows a list of member users;
// If PC is assigned, shows option to unassign/assign to another.

const AssignUserDialog: React.FC<AssignUserDialogProps> = ({
  open,
  onClose,
  pc,
  onSuccess,
}) => {
  const [assignments, setAssignments] = useState<
    Record<string, { instanceId: string }[]>
  >({});
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [query, setQuery] = useState("");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [loadingUnassign, setLoadingUnassign] = useState(false);
  const [assignPC] = useAssignPCMutation();
  const [unassignPC] = useUnassignPCMutation();
  const [triggerGetAssignments] = useLazyGetAssignmentsQuery();

  Logger.debug("AssignUserDialog render:", { setLoadingAssign });

  const { data, isLoading } = useGetUsersQuery(undefined, {
    skip: !open,
  });

  // ✅ Wrap users in useMemo so dependencies are stable (fixes exhaustive-deps warnings)
  const users: ApiUser[] = useMemo(() => data?.users ?? [], [data?.users]);

  // Fetch all assignments
  const fetchAssignments = useCallback(async () => {
    try {
      const a = await triggerGetAssignments().unwrap();
      setAssignments(a || {});
    } catch {
      // Intentionally ignored
    }
  }, [triggerGetAssignments]);

  // Find out if this PC is assigned, and to whom
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

  // For member list: filter only members
  const memberUsers = useMemo(
    () => users.filter((u) => u.role === "member"),
    [users]
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

  // On open, fetch users and assignments fresh
  useEffect(() => {
    if (open) {
      fetchAssignments();
      setQuery("");
    }
  }, [open, fetchAssignments]);

  const titleName = pc?.systemName?.trim() || pc?.instanceId || "Sense PC";

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

  // Assign to a member
  const assignToMember = async (user: ApiUser) => {
    if (!pc) return;
    setLoadingUserId(user.id);

    // If assigned to another, unassign first
    if (assignedUser && assignedUser.id !== user.id) {
      try {
        await unassignPC({
          instanceId: pc.instanceId,
          memberId: assignedUser.id,
        }).unwrap();
      } catch (e) {
        Logger.error("Failed to unassign before assigning:", e);
        toast({
          title: "Failed to unassign before assigning",
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
        title: "Assigned!",
        description: `${pc.systemName} now assigned to ${
          user.firstName || user.email
        }`,
      });
      onSuccess(); // reload
      closeDialog();
    } catch (e) {
      toast({
        title: "Failed to assign",
        variant: "destructive",
        description: getErrorMessage(e),
      });
    } finally {
      setLoadingUserId(null);
    }
  };

  // Unassign from current user
  const unassign = async () => {
    if (!pc || !assignedUser) return;
    setLoadingUnassign(true);
    try {
      await unassignPC({
        instanceId: pc.instanceId,
        memberId: assignedUser.id,
      }).unwrap();
      toast({
        title: "Unassigned!",
        description: `${pc.systemName} is now unassigned`,
      });
      onSuccess(); // reload
      closeDialog();
    } catch (e) {
      toast({
        title: "Failed to unassign",
        variant: "destructive",
        description: getErrorMessage(e),
      });
    } finally {
      setLoadingUnassign(false);
    }
  };

  const closeDialog = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent
        data-testid="sensepc-assign-modal"
        className="p-0 gap-0 overflow-hidden sm:max-w-[620px]"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div
            className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40"
            aria-hidden
          >
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
          </div>

          <DialogHeader className="relative">
            <DialogTitle className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                Assign Sense PC
              </span>
              <span className="text-[18px] leading-[26px] font-semibold text-foreground">
                {titleName}
              </span>
            </DialogTitle>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant={assignedUser ? "default" : "secondary"}
                className="rounded-full px-3 py-1"
              >
                {assignedUser ? "Assigned" : "Unassigned"}
              </Badge>

              {assignedUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">to</span>
                  <Badge
                    className="rounded-full px-3 py-1"
                    data-testid="sensepc-assigned-user-indicator"
                  >
                    {memberLabel(assignedUser)}
                  </Badge>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Choose a member to grant access.
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        <Separator />

        {/* Body */}
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading members...
            </div>
          ) : (
            <div className="space-y-5">
              {/* Current Assignment Actions */}
              <div className="rounded-2xl border bg-background/60 p-4 dark:bg-background/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Current access
                    </p>
                    {assignedUser ? (
                      <p className="text-sm text-muted-foreground">
                        This PC is currently assigned to{" "}
                        <span className="font-medium text-foreground">
                          {memberLabel(assignedUser)}
                        </span>
                        .
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No member currently has access to this PC.
                      </p>
                    )}
                  </div>

                  {assignedUser ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full"
                      onClick={unassign}
                      disabled={loadingUnassign || loadingUserId !== null}
                    >
                      {loadingUnassign ? "Unassigning..." : "Unassign"}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        const el = document.getElementById(
                          "sensepc-member-search"
                        );
                        el?.focus?.();
                      }}
                      disabled={loadingAssign}
                    >
                      Select member
                    </Button>
                  )}
                </div>
              </div>

              {/* Search + member list */}
              <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div className="space-y-1">
                    <p
                      className="text-sm font-semibold text-foreground"
                      data-testid="sensepc-assign-to-member-label"
                    >
                      Assign to member
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Search by name or email, then click Assign.
                    </p>
                  </div>

                  <div className="w-full max-w-[320px]">
                    <Input
                      id="sensepc-member-search"
                      uiSize="form"
                      placeholder="Search members…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2" data-testid="sensepc-member-list">
                  {filteredMembers.length === 0 && (
                    <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
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
                          "group rounded-2xl border p-4",
                          "bg-background/60 dark:bg-background/30",
                          "transition hover:border-indigo-500/30 hover:bg-indigo-500/[0.04]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Left */}
                          <div className="min-w-0 flex items-center gap-3">
                            <div
                              className={cn(
                                "h-10 w-10 shrink-0 rounded-full border",
                                "flex items-center justify-center",
                                "bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-300"
                              )}
                              aria-hidden
                            >
                              <span className="text-sm font-semibold">
                                {initials(u)}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {u.email}
                              </p>
                            </div>
                          </div>

                          {/* Right */}
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
                              disabled={
                                already || isRowLoading || loadingUnassign
                              }
                              variant={already ? "secondary" : "default"}
                              size="sm"
                              className="rounded-full"
                              onClick={() => assignToMember(u)}
                              data-testid="sensepc-assign-confirm-button"
                            >
                              {already
                                ? "Already Assigned"
                                : isRowLoading
                                ? "Assigning..."
                                : "Assign"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <DialogFooter className="px-6 py-4">
          <Button
            onClick={closeDialog}
            variant="outline"
            className="rounded-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserDialog;
