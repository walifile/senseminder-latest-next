"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Users,
  Search,
  Mail,
  Users2,
  Info,
  Monitor,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Mock data for SmartPCs
const mockSmartPCs = [
  { id: 1, name: "Dev PC 1", status: "Running", specs: "8 vCPU, 16GB RAM" },
  { id: 2, name: "Design PC", status: "Stopped", specs: "16 vCPU, 32GB RAM" },
  { id: 3, name: "Test PC", status: "Running", specs: "4 vCPU, 8GB RAM" },
];

// Updated mock users with assigned PCs
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "Active",
    group: "Management",
    assignedPCs: [1, 2], // References to PC IDs
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "User",
    status: "Active",
    group: "Engineering",
    assignedPCs: [3],
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "User",
    status: "Pending",
    group: "Marketing",
    assignedPCs: [],
  },
  {
    id: 4,
    name: "Bob Brown",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
    group: "Engineering",
    assignedPCs: [],
  },
  {
    id: 5,
    name: "Eve Williams",
    email: "eve@example.com",
    role: "Admin",
    status: "Active",
    group: "Management",
    assignedPCs: [],
  },
];

// Mock data for groups
const mockGroups = [
  {
    id: 1,
    name: "Management",
    members: 2,
    description: "Company management team",
  },
  {
    id: 2,
    name: "Engineering",
    members: 2,
    description: "Software engineering team",
  },
  { id: 3, name: "Marketing", members: 1, description: "Marketing department" },
  { id: 4, name: "Sales", members: 0, description: "Sales team" },
];

type UserFormValues = {
  name: string;
  email: string;
  role: string;
  group: string;
};

type GroupFormValues = {
  name: string;
  description: string;
};

const UsersManagementPage = () => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isAssignPCDialogOpen, setIsAssignPCDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const userForm = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      role: "User",
      group: "",
    },
  });

  const groupForm = useForm<GroupFormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = mockGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteUser = (data: UserFormValues) => {
    console.log("Inviting user:", data);
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${data.email}`,
    });
    setIsInviteDialogOpen(false);
    userForm.reset();
  };

  const handleCreateGroup = (data: GroupFormValues) => {
    console.log("Creating group:", data);
    toast({
      title: "Group created",
      description: `The group "${data.name}" has been created`,
    });
    setIsGroupDialogOpen(false);
    groupForm.reset();
  };

  const handleAssignPC = (userId: number) => {
    setSelectedUserId(userId);
    setIsAssignPCDialogOpen(true);
  };

  const getAssignedPCs = (pcIds: number[]) => {
    return pcIds
      .map((id) => mockSmartPCs.find((pc) => pc.id === id)?.name)
      .filter(Boolean);
  };

  // const getStatusBadge = (status: string) => {
  //   switch (status) {
  //     case "Active":
  //       return <Badge className="bg-green-500">Active</Badge>;
  //     case "Pending":
  //       return <Badge className="bg-yellow-500">Pending</Badge>;
  //     case "Inactive":
  //       return <Badge className="bg-gray-500">Inactive</Badge>;
  //     default:
  //       return <Badge>{status}</Badge>;
  //   }
  // };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "User":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-500/10 text-green-500"
      : "bg-gray-500/10 text-gray-500";
  };

  return (
    <div className="space-y-6">
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
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Admin Role</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Full account & user management control</li>
                    <li>• Create/delete SmartPCs</li>
                    <li>• Manage billing & payments</li>
                    <li>• Cannot modify own permissions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">General User Role</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Manage assigned SmartPCs</li>
                    <li>• Full storage & support access</li>
                    <li>• Cannot create/delete PCs</li>
                    <li>• Cannot invite users</li>
                  </ul>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsGroupDialogOpen(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            New Group
          </Button>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Users & Groups</CardTitle>
              <CardDescription>
                Invite, organize, and manage user access
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users or groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="users"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="users" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center">
                <Users2 className="h-4 w-4 mr-2" />
                Groups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned PCs</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getRoleBadgeColor(user.role)}
                          >
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.group}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(user.status)}
                          >
                            {user.status.charAt(0).toUpperCase() +
                              user.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getAssignedPCs(user.assignedPCs).map(
                              (pcName, index) => (
                                <Badge key={index} variant="secondary">
                                  {pcName}
                                </Badge>
                              )
                            )}
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
                              <DropdownMenuItem
                                onClick={() => handleAssignPC(user.id)}
                              >
                                <Monitor className="h-4 w-4 mr-2" />
                                Assign SmartPC
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No users found. Try adjusting your search or invite new
                        users.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          {group.name}
                        </TableCell>
                        <TableCell>{group.members}</TableCell>
                        <TableCell>{group.description}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Members
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                View Members
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Delete Group
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No groups found. Try adjusting your search or create a
                        new group.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between text-muted-foreground text-sm">
          <p>Total users: {mockUsers.length}</p>
          <p>Total groups: {mockGroups.length}</p>
        </CardFooter>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user. They will receive an email to
              set up their account.
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
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="User">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockGroups.map((group) => (
                          <SelectItem key={group.id} value={group.name}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Send Invitation</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group to organize users and manage permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...groupForm}>
            <form
              onSubmit={groupForm.handleSubmit(handleCreateGroup)}
              className="space-y-4"
            >
              <FormField
                control={groupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Engineering Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Software engineering department"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Group</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign PC Dialog */}
      <Dialog
        open={isAssignPCDialogOpen}
        onOpenChange={setIsAssignPCDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign SmartPC</DialogTitle>
            <DialogDescription>
              Select a SmartPC to assign to this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {mockSmartPCs.map((pc) => (
              <div key={pc.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{pc.name}</p>
                  <p className="text-sm text-muted-foreground">{pc.specs}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const user = mockUsers.find((u) => u.id === selectedUserId);
                    if (user && !user.assignedPCs.includes(pc.id)) {
                      user.assignedPCs.push(pc.id);
                      toast({
                        title: "PC Assigned",
                        description: `${pc.name} has been assigned to ${user.name}`,
                      });
                    }
                    setIsAssignPCDialogOpen(false);
                  }}
                >
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementPage;
