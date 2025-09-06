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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, Search, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetUsersQuery } from "@/api/user";
import UserTable from "./_components/user-table";
import { ApiUser } from "./types";
import { useBoolean } from "@/hooks/use-boolean";
import InviteUserDialog from "./_components/invite-user-dialog";

const UsersManagementPage = () => {
  const inviteDialog = useBoolean();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useGetUsersQuery();
  const users: ApiUser[] = data?.users || [];

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
          <Button onClick={inviteDialog.onTrue}>
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
                loading={isLoading}
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
      <InviteUserDialog
        open={inviteDialog.value}
        onClose={inviteDialog.onFalse}
      />
    </div>
  );
};

export default UsersManagementPage;
