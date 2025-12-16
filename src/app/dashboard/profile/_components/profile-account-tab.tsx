"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Camera } from "lucide-react";

type Profile = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  organization: string;
  role: string;
};

type Props = {
  profile: Profile | null;
  loading: boolean;
  saving: boolean;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  country: string;
  setCountry: React.Dispatch<React.SetStateAction<string>>;
  fallbackInitials: string;
  onSave: () => void;
};

export const ProfileAccountTab = ({
  profile,
  loading,
  saving,
  fullName,
  setFullName,
  country,
  setCountry,
  fallbackInitials,
  onSave,
}: Props) => {
  function prevent(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/avatar-placeholder.jpg" alt="User" />
              <AvatarFallback className="text-xl">
                {fallbackInitials}
              </AvatarFallback>
            </Avatar>

            <Button
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              JPG, GIF or PNG. Max size 2MB.
            </p>

            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Upload
              </Button>
              <Button size="sm" variant="outline">
                Remove
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={prevent} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={fullName}
              placeholder="Full Name"
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Your Country"
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email || ""} disabled />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed. Please contact support if you need to
              update your email address.
            </p>
          </div>

          <Button onClick={onSave} disabled={loading || saving} type="button">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
