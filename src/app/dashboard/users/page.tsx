"use client";

import React, { useState } from "react";
import { useGetUsersQuery } from "@/api/user";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Search, UserPlus } from "lucide-react";

import { useBoolean } from "@/hooks/use-boolean";

import UserTable from "./_components/user-table";
import InviteUserDialog from "./_components/invite-user-dialog";

import type { ApiUser } from "./types";

const UsersManagementPage = () => {
  const inviteDialog = useBoolean();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useGetUsersQuery();
  const users: ApiUser[] = data?.users || [];

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

  return (
    <div className="space-y-6">
      <Card className="relative !border-0 gradient-outline-border bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.03)]">
        <CardContent className="p-0 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-black/10 dark:border-border">
            <div className="flex items-center gap-2">
              <h1 className="justify-start text-black dark:text-white text-3xl font-semibold font-['Space_Grotesk'] leading-10">User Management</h1>
              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px]" align="start">
                  Invite and manage user access to your workspace.
                </PopoverContent>
              </Popover> */}
            </div>
            <div className="flex space-x-2">
              <Button onClick={inviteDialog.onTrue}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </div>
          </div>

          {/* Main Card (users tab only) */}
          <div className="p-6 pt-0">
            <Card className="bg-white/5 rounded-[20px] border border-indigo-400 backdrop-blur-[32px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="justify-start text-black dark:text-white text-3xl font-semibold font-['Space_Grotesk'] leading-10">Manage Users</CardTitle>
                    <CardDescription className="justify-start text-paragraph text-base font-normal font-['Inter'] leading-6">Invite and manage user access</CardDescription>
                  </div>
                  <div className="relative w-64 md:w-[465px]">
                    <div className="bg-[rgba(37,48,240,0.07)] dark:bg-[#ffffff08] rounded-[1000px] border-[none] relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[1000px] before:[background:linear-gradient(270deg,rgba(168,1,186,0.5)_0%,rgba(37,48,240,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
                      <Search className="absolute h-10 w-10 top-1/2 right-1.5 -translate-y-1/2 p-2 text-[#2530F0] dark:text-white bg-[#ced1fc] dark:bg-[rgba(255,255,255,0.03)] rounded-[23px] border border-solid border-[#2530F0] dark:border-[#A801BA]" />
                      <Input
                        id="search-users"
                        name="search-users"
                        placeholder="Search users..."
                        className="pl-6 pr-14 h-14 md:text-base rounded-full"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        value={searchQuery}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <UserTable loading={isLoading} filteredUsers={filteredUsers} />
              </CardContent>

              <CardFooter className="border-t border-black/10 dark:border-border pt-6 flex justify-between text-muted-foreground text-sm">
                <p>Total users: {users.length}</p>
              </CardFooter>
            </Card>
          </div>
          {/* --------- INVITE USER DIALOG ------- */}
          <InviteUserDialog
            open={inviteDialog.value}
            onClose={inviteDialog.onFalse}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagementPage;
