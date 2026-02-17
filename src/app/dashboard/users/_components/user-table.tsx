"use client";

import type { RootState } from "@/redux/store";

import { useResendInviteMutation } from "@/api/user";
import { useLazyGetAssignmentsQuery } from "@/api/assignpc";
import React, { useState, useEffect, useCallback } from "react";

import { Logger } from "@/lib/utils/logger";
import { Badge } from "@/components/ui/badge";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

import { useSelector } from "react-redux";

import { Info, Mail, UserX, Monitor } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { useBoolean } from "@/hooks/use-boolean";

import { ActionsMenu } from "@/components/shared/menus";

import ManagePcDialog from "./manage-pc-dialog";
import DeleteUserDialog from "./delete-user-dialog";
import { getStatusColor, getRoleBadgeColor } from "../utils";

import type { ApiUser } from "../types";

const headers = ["Name", "Email", "Role", "Status", "Assigned PCs", "Actions"];

type Props = {
  loading: boolean;
  filteredUsers: ApiUser[];
  isMember: boolean;
};

type AssignmentItem = {
  instanceId: string;
  systemName?: string;
};

const UserTable = ({ loading, filteredUsers, isMember }: Props) => {
  const showDeleteDialog = useBoolean();
  const managePCDialog = useBoolean();
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const currentRole = currentUser?.role;

  const [fetchAssignmentsLoading, setFetchAssignmentsLoading] = useState(false);
  const [assignments, setAssignments] = useState<
    Record<string, AssignmentItem[]>
  >({});
  const [triggerGetAssignments] = useLazyGetAssignmentsQuery();

  const [resendTargetEmail, setResendTargetEmail] = useState<string | null>(
    null,
  );
  const [resendInvite] = useResendInviteMutation();

  const fetchAssignments = useCallback(async () => {
    setFetchAssignmentsLoading(true);
    try {
      const res = await triggerGetAssignments().unwrap();
      setAssignments(res || {});
    } catch (e: unknown) {
      toast({
        title: "Failed to fetch assignments",
        variant: "destructive",
        description:
          typeof e === "object" && e !== null && "message" in e
            ? String((e as { message?: unknown }).message)
            : "Failed to fetch assignments.",
      });
    } finally {
      setFetchAssignmentsLoading(false);
    }
  }, [triggerGetAssignments]);

  useEffect(() => {
    if (isMember) return;
    fetchAssignments();
  }, [fetchAssignments, isMember]);

  const globalReload = () => {
    fetchAssignments();
  };

  const promptDeleteUser = (user: ApiUser) => {
    setSelectedUser(user);
    showDeleteDialog.onTrue();
  };

  const handleAssignPC = (user: ApiUser) => {
    setSelectedUser(user);
    managePCDialog.onTrue();
  };

  const handleResendInvite = async (user: ApiUser) => {
    if (resendTargetEmail) return;
    setResendTargetEmail(user.email);
    try {
      await resendInvite({ action: "resend", email: user.email }).unwrap();
      toast({
        title: "Invitation resent",
        description: `An invitation has been resent to ${user.email}`,
      });
    } catch (e) {
      toast({
        title: "Failed to resend invite",
        variant: "destructive",
        description: getErrorMessage(e, "Failed to resend invite"),
      });
      Logger.error("Failed to resend invite:", e);
    } finally {
      setResendTargetEmail(null);
    }
  };

  return (
    <>
      <Table data-testid="user-management-users-table">
        <TableHeader>
          <TableRow className="bg-blue-700/10 dark:bg-[#ffffff0f] hover:bg-blue-700/10 dark:hover:bg-[#ffffff0f]">
            {headers.map((header, i) => {
              const isFirst = i === 0;
              const isLast = i === headers.length - 1;
              const isSecondLast = i === headers.length - 1;

              return (
                <TableHead
                  key={i}
                  className={cn(
                    // first column
                    isFirst && "w-[40px] rounded-tl-xl",
                    // last column
                    isLast && "rounded-tr-xl border-l-0",
                    // middle columns
                    isSecondLast && "border-r-0",
                  )}
                >
                  {header}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isMember ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                <span className="inline-flex items-center gap-2">
                  <Info className="h-4 w-4 text-red-500" />
                  You are not allowed to see the user list.
                </span>
              </TableCell>
            </TableRow>
          ) : loading ? (
            <TableRow className="hover:bg-muted/50">
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                Loading users...
              </TableCell>
            </TableRow>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {user.firstName || user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", getRoleBadgeColor(user.role))}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", getStatusColor(user.status))}
                  >
                    {user.status || <>&mdash;</>}
                  </Badge>
                </TableCell>
                {/* ASSIGNED PCS */}
                <TableCell className="border-r-0">
                  <div className="flex flex-wrap gap-1">
                    {(assignments[user.id] ?? []).length > 0 ? (
                      assignments[user.id].map((pc) => (
                        <Badge
                          variant="secondary"
                          className="mr-1 mb-1"
                          key={pc.instanceId}
                        >
                          {pc.systemName || pc.instanceId}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">&mdash;</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    const canDelete =
                      currentRole === "owner" ||
                      (currentRole === "admin" && user.role === "member");

                    const actions = [
                      ...(user.role === "member"
                        ? [
                            {
                              label: "Manage PC",
                              icon: Monitor,
                              onClick: () => handleAssignPC(user),
                            },
                          ]
                        : []),
                      ...(user.status?.toLowerCase() === "pending"
                        ? [
                            {
                              label:
                                resendTargetEmail === user.email
                                  ? "Resending..."
                                  : "Resend Invite",
                              icon: Mail,
                              onClick: () => handleResendInvite(user),
                            },
                          ]
                        : []),
                      ...(canDelete
                        ? [
                            {
                              label: "Delete",
                              icon: UserX,
                              isDestructive: true,
                              onClick: () => promptDeleteUser(user),
                            },
                          ]
                        : []),
                    ];

                    if (actions.length === 0) {
                      return (
                        <span className="text-muted-foreground">&mdash;</span>
                      );
                    }

                    return <ActionsMenu actions={actions} />;
                  })()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                No users found. Try adjusting your search or invite new users.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ASSIGN/UNASSIGN PC DIALOG */}
      <ManagePcDialog
        open={managePCDialog.value}
        onClose={managePCDialog.onFalse}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        globalReload={globalReload}
        fetchAssignmentsLoading={fetchAssignmentsLoading}
        assignments={assignments}
      />

      {/* DELETE USER CONFIRMATION */}
      <DeleteUserDialog
        open={showDeleteDialog.value}
        onClose={showDeleteDialog.onFalse}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        globalReload={globalReload}
      />
    </>
  );
};

export default UserTable;
