"use client";

import type { PC } from "@/app/build-sensepc/types";

import { useLazyGetAssignmentsQuery } from "@/api/assignpc";
import React, { useState, useEffect, useCallback } from "react";

import { cn } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

import { Mail, UserX, Monitor, UserCheck } from "lucide-react";

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
};

const UserTable = ({ loading, filteredUsers }: Props) => {
  const showDeleteDialog = useBoolean();
  const managePCDialog = useBoolean();
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  const [fetchAssignmentsLoading, setFetchAssignmentsLoading] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, PC[]>>({});
  const [triggerGetAssignments] = useLazyGetAssignmentsQuery();

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
    fetchAssignments();
  }, [fetchAssignments]);

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
                    isSecondLast && "border-r-0"
                  )}
                >
                  {header}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
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
                      assignments[user.id].map((pc: PC) => (
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
                  <ActionsMenu
                    actions={[
                      ...(user.role === "member"
                        ? [
                            {
                              label: "Manage PC",
                              icon: Monitor,
                              onClick: () => handleAssignPC(user),
                            },
                          ]
                        : []),
                      {
                        label: "Change Role",
                        icon: UserCheck,
                        onClick: () => Logger.log("Change Role clicked"),
                      },
                      ...(user.status?.toLowerCase() === "pending"
                        ? [
                            {
                              label: "Resend Invite",
                              icon: Mail,
                              onClick: () =>
                                Logger.log("Resend Invite clicked"),
                            },
                          ]
                        : []),
                      {
                        label: "Delete",
                        icon: UserX,
                        isDestructive: true,
                        onClick: () => promptDeleteUser(user),
                      },
                    ]}
                  />
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
