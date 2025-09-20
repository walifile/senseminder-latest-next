"use client";

import type { PC } from "@/app/build-smartpc/types";

import { useGetUsersQuery } from "@/api/user";
import React, { useState, useEffect, useCallback } from "react";
import { assignPC, unassignPC, getAssignments } from "@/api/assignpc";

import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
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
  pc: PC | null;
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

  const { data, isLoading } = useGetUsersQuery(undefined, {
    skip: !open,
  });
  const users: ApiUser[] = data?.users || [];

  // Fetch all assignments
  const fetchAssignments = useCallback(async () => {
    try {
      const a = await getAssignments();
      setAssignments(a || {});
    } catch {
      // Intentionally ignored
    }
  }, []);

  // On open, fetch users and assignments fresh
  useEffect(() => {
    if (open) {
      fetchAssignments();
    }
  }, [open, fetchAssignments]);

  // Find out if this PC is assigned, and to whom
  let assignedUser: ApiUser | null = null;
  if (pc && assignments) {
    for (const uid in assignments) {
      const arr = assignments[uid];
      if (
        Array.isArray(arr) &&
        arr.some((a) => a.instanceId === pc.instanceId)
      ) {
        assignedUser = users.find((u) => u.id === uid) || null;
        break;
      }
    }
  }

  // For member list: filter only members
  const memberUsers = users.filter((u) => u.role === "member");

  // Assign to a member
  const assignToMember = async (user: ApiUser) => {
    if (!pc) return;
    setLoadingAssign(true);
    // If assigned to another, unassign first
    if (assignedUser && assignedUser.id !== user.id) {
      try {
        await unassignPC({
          instanceId: pc.instanceId,
          memberId: assignedUser.id,
        });
      } catch (e) {
        console.error("Failed to unassign before assigning:", e);
        toast({
          title: "Failed to unassign before assigning",
          variant: "destructive",
        });
        setLoadingAssign(false);
        return;
      }
    }
    try {
      await assignPC({
        instanceId: pc.instanceId,
        memberId: user.id,
        systemName: pc.systemName || "",
      });
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
      setLoadingAssign(false);
    }
  };

  // Unassign from current user
  const unassign = async () => {
    if (!pc || !assignedUser) return;
    setLoadingAssign(true);
    try {
      await unassignPC({
        instanceId: pc.instanceId,
        memberId: assignedUser.id,
      });
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
      setLoadingAssign(false);
    }
  };

  const closeDialog = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign SmartPC</DialogTitle>
          <DialogDescription>
            {pc?.systemName} ({pc?.instanceId})
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div>Loading members...</div>
        ) : (
          <div className="space-y-3">
            {/* Current Assignment */}
            {assignedUser ? (
              <div>
                <div>
                  Currently assigned to:
                  <Badge className="ml-2">
                    {assignedUser.firstName || assignedUser.email}
                  </Badge>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={unassign}
                  disabled={loadingAssign}
                >
                  {loadingAssign ? "Unassigning..." : "Unassign"}
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground">
                This PC is not assigned to any user.
              </div>
            )}

            {/* Assignment options */}
            <div>
              <div className="font-bold mb-2 mt-4">Assign to Member:</div>
              <div className="flex flex-col gap-2">
                {memberUsers.length === 0 && <div>No members found.</div>}
                {memberUsers.map((user) => (
                  <Button
                    disabled={!!assignedUser && assignedUser.id === user.id}
                    variant={
                      !!assignedUser && assignedUser.id === user.id
                        ? "secondary"
                        : "default"
                    }
                    key={user.id}
                    onClick={() => assignToMember(user)}
                  >
                    {user.firstName || user.email}
                    {!!assignedUser &&
                      assignedUser.id === user.id &&
                      " (Already Assigned)"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={closeDialog} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserDialog;
