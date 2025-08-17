"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { UserPlus, Users, Search, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { inviteUser, getUsers, deleteUser } from "@/api/user";
import UserTable from "./_components/user-table";
import { ApiUser, UserFormValues } from "./types";

const UsersManagementPage = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

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

  useEffect(() => {
    fetchUserList();
  }, [fetchUserList]);

  // Find owner/admin for fetching remote desktops
  const mainUser = users.find(
    // @ts-expect-error smv
    (u) => u.role === "owner" || u.role === "admin" || u.role === "member"
  );

  // Filter users (remove group search)
  const filteredUsers = users.filter(
    (user) =>
      (
        user.firstName?.toLowerCase() +
        " " +
        user.lastName?.toLowerCase()
      ).includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleInviteUser = async (data: UserFormValues) => {
    setInviteLoading(true);
    try {
      const apiPayload = {
        name: data.name,
        email: data.email,
        role:
          data.role === "admin" || data.role === "Admin" ? "admin" : "member",
        group: "", // always send blank
      };
      //@ts-expect-error avc
      await inviteUser(apiPayload);
      toast({
        title: "User invited",
        description: `An invitation has been sent to ${data.email}`,
      });
      setIsInviteDialogOpen(false);
      fetchUserList();
      userForm.reset();
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
              <CardDescription>Invite and manage user access</CardDescription>
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
              <UserTable
                loading={loading}
                mainUser={mainUser}
                filteredUsers={filteredUsers}
              />
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
    </div>
  );
};

export default UsersManagementPage;
