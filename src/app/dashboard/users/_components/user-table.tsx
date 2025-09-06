"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCheck, UserX, Mail, Monitor } from "lucide-react";
import { getRoleBadgeColor, getStatusColor } from "../utils";
import { ApiUser } from "../types";
import DeleteUserDialog from "./delete-user-dialog";
import { useBoolean } from "@/hooks/use-boolean";
import { cn } from "@/lib/utils";
import { ActionsMenu } from "@/components/shared/menus";
import ManagePcDialog from "./manage-pc-dialog";
import { toast } from "@/hooks/use-toast";
import { getAssignments } from "@/api/assignpc";

const headers = ["Name", "Email", "Role", "Status", "Assigned PCs", ""];

type Props = {
  loading: boolean;
  filteredUsers: ApiUser[];
};

const UserTable = ({ loading, filteredUsers }: Props) => {
  const showDeleteDialog = useBoolean();
  const managePCDialog = useBoolean();
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  const [fetchAssignmentsLoading, setFetchAssignmentsLoading] = useState(false);
  const [assignments, setAssignments] = useState<any>({});

  const fetchAssignments = useCallback(async () => {
    setFetchAssignmentsLoading(true);
    try {
      const res = await getAssignments();
      setAssignments(res || {});
    } catch (e: any) {
      toast({
        title: "Failed to fetch assignments",
        variant: "destructive",
        description: (e && e.message) || "Failed to fetch assignments.",
      });
    } finally {
      setFetchAssignmentsLoading(false);
    }
  }, []);

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
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, i) => (
              <TableHead key={i}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                Loading users...
              </TableCell>
            </TableRow>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
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
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(assignments[user.id] ?? []).length > 0 ? (
                      assignments[user.id].map((pc: any) => (
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
                        onClick: () => console.log("Change Role clicked"),
                      },
                      {
                        label: "Resend Invite",
                        icon: Mail,
                        onClick: () => console.log("Resend Invite clicked"),
                      },
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
