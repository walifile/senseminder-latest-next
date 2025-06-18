"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus, MoreHorizontal, UserCheck, UserX, Users, Search, Mail,
  Info, Monitor,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { assignPC, unassignPC, getAssignments } from "@/api/assignpc";
import { inviteUser, getUsers, deleteUser } from "@/api/user";
import { useListRemoteDesktopQuery } from "@/api/fileManagerAPI";

// --- Remove all group-related types, options, sample data ---

type UserFormValues = {
  name: string;
  email: string;
  role: string;
};

type ApiUser = {
  email: string;
  firstName?: string;
  lastName?: string;
  id: string;
  role: "admin" | "member";
  owner_id: string;
  createdAt: string;
  country?: string;
  organization?: string;
  phoneNumber?: string;
  status?: "active" | "pending" | string;
};

const UsersManagementPage = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isAssignPCDialogOpen, setIsAssignPCDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteUserEmail, setDeleteUserEmail] = useState<string | null>(null);
  const [deleteUserRole, setDeleteUserRole] = useState<"admin" | "member" | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deletingUser, setDeletingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [smartPCs, setSmartPCs] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any>({});
  const [fetchAssignmentsLoading, setFetchAssignmentsLoading] = useState(false);

  // For PC assign/unassign
  const [pcAssigningId, setPCAssigningId] = useState<string | null>(null);

  // Invite user form
  const userForm = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });

  // Fetch users
  const fetchUserList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.users || []);
    } catch (e: any) {
      toast({
        title: "Failed to fetch users",
        variant: "destructive",
        description: (e && e.message) || "Failed to fetch users.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUserList(); }, [fetchUserList, reloadFlag]);

  // Find owner/admin for fetching remote desktops
  const mainUser = users.find(
    // @ts-ignore
    (u) => u.role === "owner" || u.role === "admin" || u.role === "member"
  );
  const {
    data: fetchedSmartPCs,
    isLoading: isSmartPCLoading,
    error: smartPCError,
    refetch: refetchSmartPCs,
  } = useListRemoteDesktopQuery(
    mainUser
      ? { userId: mainUser.owner_id || mainUser.id }
      : { userId: undefined },
    { skip: !mainUser }
  );

  useEffect(() => {
    setSmartPCs(Array.isArray(fetchedSmartPCs) ? fetchedSmartPCs : []);
  }, [fetchedSmartPCs]);

  // Fetch assignments for ALL members (for PC assign badge column)
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
  useEffect(() => { fetchAssignments(); }, [reloadFlag, fetchAssignments]);

  // "Reload everything" fn
  const globalReload = () => {
    setReloadFlag((r) => r + 1);
    if (mainUser) {         
      refetchSmartPCs();
    }
    fetchAssignments();
  };

  // Filter users (remove group search)
  const filteredUsers = users.filter(
    (user) =>
      ((user.firstName?.toLowerCase() + " " + user.lastName?.toLowerCase()).includes(searchQuery.toLowerCase())) ||
      (user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handlers
  const handleInviteUser = async (data: UserFormValues) => {
    setInviteLoading(true);
    try {
      const apiPayload = {
        name: data.name,
        email: data.email,
        role: data.role === "admin" || data.role === "Admin" ? "admin" : "member",
        group: "", // always send blank
      };
      //@ts-ignore
      await inviteUser(apiPayload);
      toast({
        title: "User invited",
        description: `An invitation has been sent to ${data.email}`,
      });
      setIsInviteDialogOpen(false);
      userForm.reset();
      globalReload();
    } catch (e: any) {
      toast({
        title: "Failed to invite user",
        variant: "destructive",
        description: (e && e.message) || "Failed to invite user.",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const promptDeleteUser = (email: string, role: "admin" | "member") => {
    setDeleteUserEmail(email);
    setDeleteUserRole(role);
    setDeleteConfirmInput("");
    setShowDeleteDialog(true);
  };
  const handleDeleteUser = async () => {
    if (!deleteUserEmail || !deleteUserRole) return;
    setDeletingUser(true);
    try {
      await deleteUser(deleteUserEmail, deleteUserRole);
      toast({
        title: "User deleted",
        description: `The user ${deleteUserEmail} has been deleted.`,
      });
      setShowDeleteDialog(false);
      setDeleteUserEmail(null);
      setDeleteUserRole(null);
      globalReload();
    } catch (e: any) {
      toast({
        title: "Failed to delete user",
        variant: "destructive",
        description: (e && e.message) || "Failed to delete user.",
      });
    } finally {
      setDeletingUser(false);
      setDeleteConfirmInput("");
    }
  };

  function getRoleBadgeColor(role: string) {
    switch ((role || "").toLowerCase()) {
      case "admin":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "user":
      case "member":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  }
  function getStatusColor(status?: string) {
    if (!status) return "bg-gray-500/10 text-gray-500";
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/10 text-green-500";
      case "pending":
        return "bg-yellow-400/20 text-yellow-700";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  }

  const handleAssignPC = (user: ApiUser) => {
    setSelectedUser(user);
    setIsAssignPCDialogOpen(true);
  };

  // For dialog UI: show assigned/unassigned for this member.
  const getAssignedPCs = (memberId: string) =>
    Array.isArray(assignments[memberId]) ? assignments[memberId] : [];

  // To show assigned in the main table
  const getAssignedPCBadgeList = (user: ApiUser) => {
    const pcs = getAssignedPCs(user.id);
    if (!pcs?.length) return [<Badge variant="secondary" key="none">&mdash;</Badge>];
    return pcs.map((pc) => (
      <Badge variant="secondary" className="mr-1 mb-1" key={pc.instanceId}>
        {pc.systemName || pc.instanceId}
      </Badge>
    ));
  };

  const assignSmartPC = async (instance: any) => {
    if (!selectedUser) return;
    setPCAssigningId(instance.instanceId);
    try {
      await assignPC({
        memberId: selectedUser.id,
        instanceId: instance.instanceId,
        systemName: instance.systemName,
      });
      toast({
        title: "PC Assigned",
        description: `${instance.systemName} assigned to ${selectedUser.firstName || selectedUser.email}`,
      });
      setTimeout(globalReload, 300);
    } catch (e: any) {
      toast({
        title: "Failed to assign PC",
        variant: "destructive",
        description: e?.message || "Failed to assign",
      });
    } finally {
      setPCAssigningId(null);
    }
  };
  const unassignSmartPC = async (instance: any) => {
    if (!selectedUser) return;
    setPCAssigningId(instance.instanceId);
    try {
      await unassignPC({
        memberId: selectedUser.id,
        instanceId: instance.instanceId,
      });
      toast({
        title: "PC Unassigned",
        description: `${instance.systemName} unassigned from ${selectedUser.firstName || selectedUser.email}`,
      });
      setTimeout(globalReload, 300);
    } catch (e: any) {
      toast({
        title: "Failed to unassign PC",
        variant: "destructive",
        description: e?.message || "Failed to unassign",
      });
    } finally {
      setPCAssigningId(null);
    }
  };

  const closeAssignPCDialog = () => {
    setSelectedUser(null);
    setIsAssignPCDialogOpen(false);
    setPCAssigningId(null);
  };

  // ---- UI ----

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px]" align="start">
              {/* info here, unchanged */}
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Main Card (users tab only) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>
                Invite and manage user access
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" value="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned PCs</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {(user.firstName || "") + (user.lastName ? (" " + user.lastName) : "") || user.email}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(user.status)}
                          >
                            {user.status
                              ? user.status === "active"
                                ? "Active"
                                : user.status === "pending"
                                ? "Pending"
                                : user.status.charAt(0).toUpperCase() + user.status.slice(1)
                              : <>&mdash;</>}
                          </Badge>
                        </TableCell>
                        {/* ASSIGNED PCS */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getAssignedPCBadgeList(user)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user.role?.toLowerCase() === "member" && (
                                <DropdownMenuItem
                                  onClick={() => handleAssignPC(user)}
                                >
                                  <Monitor className="h-4 w-4 mr-2" />
                                  Manage PC
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => promptDeleteUser(user.email, user.role)}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between text-muted-foreground text-sm">
          <p>Total users: {users.length}</p>
        </CardFooter>
      </Card>

      {/* --------- INVITE USER DIALOG ------- */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user. They will receive an email to set up their account.
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form
              onSubmit={userForm.handleSubmit(handleInviteUser)}
              className="space-y-4"
            >
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={inviteLoading}>
                  {inviteLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---------- ASSIGN/UNASSIGN PC DIALOG ---------- */}
      <Dialog open={isAssignPCDialogOpen} onOpenChange={closeAssignPCDialog}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>
              Manage PCs for
              {selectedUser ? ` ${selectedUser.firstName || ""} ${selectedUser.lastName || ""} (${selectedUser.email})` : ""}
            </DialogTitle>
            <DialogDescription>
              Assign or unassign SmartPCs for this member.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto mt-4">
            {isSmartPCLoading || fetchAssignmentsLoading ? (
              <div className="text-muted-foreground">Loading PCs...</div>
            ) : !selectedUser ? (
              <div className="italic text-muted-foreground">No user selected.</div>
            ) : smartPCs.length === 0 ? (
              <div className="italic">No SmartPCs available to assign.</div>
            ) : (
              <div className="space-y-3">
                {smartPCs.map((pc) => {
                  const assignedToCurrent = getAssignedPCs(selectedUser.id).some(
                    (a) => a.instanceId === pc.instanceId
                  );
                  const isAssignedElsewhere = Object.entries(assignments)
                    .some(([memberId, arr]) =>
                      //@ts-ignore
                      (memberId !== selectedUser.id) && arr?.some(
                        (a: any) => a.instanceId === pc.instanceId
                      )
                    );
                  const disabled =
                    (assignedToCurrent && pcAssigningId === pc.instanceId) ||
                    (isAssignedElsewhere && !assignedToCurrent);

                  let btnType = "assign";
                  let btnText = "Assign";
                  let btnColor = "bg-green-500 text-white hover:bg-green-700";
                  if (assignedToCurrent) {
                    btnType = "unassign";
                    btnText = "Unassign";
                    btnColor = "bg-red-500 text-white hover:bg-red-700";
                  } else if (isAssignedElsewhere) {
                    btnType = "assigned";
                    btnText = "Assigned to Another";
                    btnColor = "bg-gray-400 text-white cursor-not-allowed";
                  }
                  return (
                    <div
                      key={pc.instanceId}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <div className="font-bold">{pc.systemName || pc.instanceId}</div>
                        <div className="text-xs text-muted-foreground">
                          {pc.instanceId}
                          {pc.state ? ` · ${pc.state}` : ""}
                        </div>
                      </div>
                      <div>
                        {btnType === "assign" && (
                          <Button
                            size="sm"
                            className={btnColor}
                            disabled={disabled}
                            onClick={() => assignSmartPC(pc)}
                          >
                            {pcAssigningId === pc.instanceId ? "Assigning..." : btnText}
                          </Button>
                        )}
                        {btnType === "unassign" && (
                          <Button
                            size="sm"
                            className={btnColor}
                            disabled={disabled}
                            onClick={() => unassignSmartPC(pc)}
                          >
                            {pcAssigningId === pc.instanceId ? "Unassigning..." : btnText}
                          </Button>
                        )}
                        {btnType === "assigned" && (
                          <Button disabled size="sm" className={btnColor}>
                            {btnText}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAssignPCDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE USER CONFIRMATION */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              To delete <b>{deleteUserEmail}</b>, please type <b>confirm</b> below and click "Delete". <br />
              This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder='Type "confirm" to proceed'
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
            disabled={deletingUser}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deletingUser}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteConfirmInput !== "confirm" || deletingUser}
            >
              {deletingUser ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementPage;
