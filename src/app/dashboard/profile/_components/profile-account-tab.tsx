
"use client";

import React from "react";
import {
  uploadAvatarToS3,
  useCreateAvatarUploadUrlMutation,
  useDeleteAvatarMutation,
  useLazyGetUserProfileQuery,
} from "@/api/profileManagement";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Camera } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

type Profile = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  organization: string;
  role: string;
  avatarUrl?: string;
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
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
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
  setProfile,
}: Props) => {
  const { toast } = useToast();
  const [triggerGetUserProfile] = useLazyGetUserProfileQuery();
  const [createAvatarUploadUrl] = useCreateAvatarUploadUrlMutation();
  const [deleteAvatar] = useDeleteAvatarMutation();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [avatarRemoving, setAvatarRemoving] = React.useState(false);

  function prevent(e: React.FormEvent) {
    e.preventDefault();
  }

  const avatarSrc: string | null = profile?.avatarUrl || null;

  const labelClass =
    "font-['Space_Grotesk'] text-[18px] font-semibold leading-[32px] tracking-[-0.3px] text-text-heading dark:text-white";

  const fieldSurfaceClass =
    "font-['Space_Grotesk'] bg-select-pill-bg border border-select-pill-border rounded-[10px] px-5 py-4 h-auto";

  function getFileExt(file: File) {
    const name = file.name || "";
    const dot = name.lastIndexOf(".");
    const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
    if (!ext && file.type?.includes("/")) return file.type.split("/")[1];
    return ext;
  }

  function isAllowedImage(file: File) {
    const allowed = ["png", "jpg", "jpeg", "webp", "gif"];
    const ext = getFileExt(file);
    const isImage = file.type?.startsWith("image/");
    return isImage && !!ext && allowed.includes(ext);
  }

  async function refreshProfile() {
    const data = await triggerGetUserProfile().unwrap();
    setProfile(data);
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max file size is 2MB.",
        variant: "destructive",
      });
      return;
    }

    if (!isAllowedImage(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, JPEG, WEBP, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    setAvatarUploading(true);
    try {
      const ext = getFileExt(file);

      const { uploadUrl } = await createAvatarUploadUrl({
        contentType: file.type || "image/*",
        fileExt: ext,
      }).unwrap();

      await uploadAvatarToS3({ uploadUrl, file });
      await refreshProfile();

      toast({
        title: "Profile picture updated",
        description: "Your new profile picture has been uploaded.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to upload avatar.";

      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemove = async () => {
    setAvatarRemoving(true);
    try {
      await deleteAvatar().unwrap();
      await refreshProfile();

      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to remove avatar.";

      toast({
        title: "Remove failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setAvatarRemoving(false);
    }
  };

  const disableAvatarActions = loading || saving || avatarUploading || avatarRemoving;

  return (
    <div className="font-['Space_Grotesk'] grid items-start gap-6 lg:grid-cols-[auto_1fr]">
      <DashboardCard className="p-6 bg-public-card-bg-dark dark:bg-public-card-bg-dark backdrop-blur-none font-['Space_Grotesk']">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20">
              {avatarSrc ? <AvatarImage src={avatarSrc} alt="Profile" /> : null}
              <AvatarFallback className="font-['Space_Grotesk'] text-base">
                {fallbackInitials}
              </AvatarFallback>
            </Avatar>

            <div className="absolute -bottom-1 left-[58%] rounded-[12px] bg-gradient-to-l from-brand-magenta to-link-primary p-[4.8px]">
              <Camera className="h-[14px] w-[14px] text-white" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="space-y-1">
              <p className="font-['Space_Grotesk'] truncate text-[16px] font-semibold leading-[1.6] text-text-heading dark:text-white">
                {fullName || "—"}
              </p>
              <p className="font-['Space_Grotesk'] text-[12px] font-normal text-input-placeholder dark:text-muted-foreground">
                JPG, GIF or PNG. Max size 2MB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                className="hidden"
                onChange={handleFilePicked}
              />

              <Button
                type="button"
                size="sm"
                disabled={disableAvatarActions}
                onClick={handleUploadClick}
              >
                {avatarUploading ? "Uploading..." : "Upload"}
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disableAvatarActions || !avatarSrc}
                onClick={handleRemove}
              >
                {avatarRemoving ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard className="p-6 bg-public-card-bg-dark dark:bg-public-card-bg-dark font-['Space_Grotesk']">
        <form
          onSubmit={prevent}
          className="flex flex-col gap-5 font-['Space_Grotesk']"
        >
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

          <p className="font-['Space_Grotesk'] text-[16px] leading-[24px] tracking-[-0.3px] text-input-placeholder dark:text-muted-foreground">
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
