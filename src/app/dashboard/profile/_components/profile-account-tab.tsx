"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

  const avatarSrc: string | null = null;

  const labelClass =
    "text-[18px] font-semibold leading-[32px] tracking-[-0.3px] text-text-heading dark:text-white";

  const fieldSurfaceClass =
    "bg-select-pill-bg border border-select-pill-border rounded-[10px] px-5 py-4 h-auto";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[auto_1fr]">
      {/* Left card: use default DashboardCard */}
      <DashboardCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20">
              {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
              <AvatarFallback className="text-base">
                {fallbackInitials}
              </AvatarFallback>
            </Avatar>

            {/* camera badge */}
            <div className="absolute -bottom-1 left-[58%] rounded-[12px] bg-gradient-to-l from-brand-magenta to-link-primary p-[4.8px]">
              <Camera className="h-[14px] w-[14px] text-white" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="space-y-1">
              <p className="truncate text-[16px] font-semibold leading-[1.6] text-text-heading dark:text-white">
                {fullName || "—"}
              </p>
              <p className="text-[12px] font-normal text-input-placeholder dark:text-muted-foreground">
                JPG, GIF or PNG. Max size 2MB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" size="sm" disabled={loading || saving}>
                Upload
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading || saving}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Right card: default DashboardCard + light override to dark bg */}
      <DashboardCard className="p-6 bg-public-card-bg-dark dark:bg-public-card-bg-dark">
        <form onSubmit={prevent} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="fullName" className={labelClass}>
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading || saving}
              autoComplete="name"
              className={fieldSurfaceClass}
              placeholder="Full Name"
              data-testid="profile-full-name-input"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="email" className={labelClass}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className={`${fieldSurfaceClass} opacity-50`}
              data-testid="profile-email-input"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="country" className={labelClass}>
              Country
            </Label>
            <Input
              id="country"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={loading || saving}
              autoComplete="country-name"
              className={fieldSurfaceClass}
              placeholder="Your Country"
              data-testid="profile-country-input"
            />
          </div>

          <p className="text-[16px] leading-[24px] tracking-[-0.3px] text-input-placeholder dark:text-muted-foreground">
            Email cannot be changed. Please contact support if you need to update
            your email address.
          </p>

          <div>
            <Button
              type="button"
              onClick={onSave}
              disabled={loading || saving}
              data-testid="profile-save-changes-button"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
};
