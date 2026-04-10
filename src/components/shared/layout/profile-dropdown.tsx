
/* eslint perfectionist/sort-imports: "off" */

"use client";

import type { RootState } from "@/redux/store";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { routes } from "@/constants/routes";
import FeedbackDialog from "@/app/dashboard/_components/feedback-dialog";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarFallback } from "@/lib/utils/index";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { checkOnboarded } from "@/lib/utils/checkOnboarded";
import { handleSignOut } from "@/lib/services/auth";
import { useLazyGetUserProfileQuery } from "@/api/profileManagement";

import {
  User,
  LogOut,
  CreditCard,
  ChevronDown,
  MessageSquarePlus,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useBoolean } from "@/hooks/use-boolean";

type UserProfile = {
  avatarUrl?: string;
};

const ProfileDropdown = () => {
  const router = useRouter();
  const { toast } = useToast();

  const { user } = useSelector((state: RootState) => state.auth);

  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [triggerGetUserProfile] = useLazyGetUserProfileQuery();

  // Avatar URL is NOT in redux user (based on your code), so fetch from profile API.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const feedbackDialog = useBoolean();

  const fullName = useMemo(() => {
    const f = user?.firstName?.trim() ?? "";
    const l = user?.lastName?.trim() ?? "";
    return `${f} ${l}`.trim();
  }, [user?.firstName, user?.lastName]);
  

  const loadAvatar = async () => {
    try {
      const profile = (await triggerGetUserProfile().unwrap()) as UserProfile | null;
      setAvatarUrl(profile?.avatarUrl ? String(profile.avatarUrl) : null);
    } catch {
      // Silent fail — fallback initials will show.
      setAvatarUrl(null);
    }
  };

  useEffect(() => {
    const fetchOnboarded = async () => {
      const onboarded = await checkOnboarded();
      setIsOnboarded(onboarded);
    };
    fetchOnboarded();
  }, []);

  // Initial load
  useEffect(() => {
    void loadAvatar();
     
  }, []);

  // Refresh avatar when dropdown opens (useful right after upload)
  useEffect(() => {
    if (!menuOpen) return;
    void loadAvatar();
     
  }, [menuOpen]);

  // Refresh on tab focus / returning to the page
  useEffect(() => {
    const onFocus = () => void loadAvatar();
    const onVis = () => {
      if (document.visibilityState === "visible") void loadAvatar();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    // Optional: allow other pages to force refresh:
    // window.dispatchEvent(new Event("sensepc:profile-updated"))
    const onProfileUpdated = () => void loadAvatar();
    window.addEventListener(
      "sensepc:profile-updated",
      onProfileUpdated as EventListener
    );

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener(
        "sensepc:profile-updated",
        onProfileUpdated as EventListener
      );
    };
     
  }, []);

  const handleLogout = async () => {
    try {
      const response = await handleSignOut();
      if (response.success) {
        toast({
          title: "Success",
          description: "Logged out successfully!",
        });
        router.push(routes?.home);
      } else {
        toast({
          title: "Logout Failed",
          description: response.error || "Logout failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong during logout.";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (!isOnboarded) return null;

  return (
    <>
      <DropdownMenu modal={false} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-10 items-center justify-center gap-2 px-0
                       md:size-10 md:w-auto md:items-center md:justify-start md:pl-0 md:pr-3"
            data-testid="dashboard-user-account-icon"
          >
            <Avatar className="size-10 md:size-10">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={fullName ? `${fullName} avatar` : "Profile"}
                />
              ) : null}
              <AvatarFallback>{getAvatarFallback(user ?? {})}</AvatarFallback>
            </Avatar>

            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-5">{fullName}</p>
              <p className="text-xs leading-4 text-muted-foreground">{user?.email}</p>
            </div>

            <ChevronDown className="hidden h-4 w-4 md:block" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/dashboard/billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={feedbackDialog.onTrue}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Product Feedback
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600"
            data-testid="dashboard-logout-button"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FeedbackDialog open={feedbackDialog.value} onClose={feedbackDialog.onFalse} />
    </>
  );
};

export default ProfileDropdown;
