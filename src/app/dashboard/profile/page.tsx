
"use client";

import { useSearchParams } from "next/navigation";
import React, { useRef, useMemo, useState, useEffect } from "react";
import {
  useLazyGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/api/profileManagement";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

import { UserRound, ShieldCheck } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { ProfileAccountTab } from "./_components/profile-account-tab";
import { ProfileSecurityTab } from "./_components/profile-security-tab";

import type { ApiUser } from "../users/types";

type Profile = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  organization: string;
  role: string;
};

const ICONS = {
  orgEditLight: "/assets/dashboard/write-light.svg",
  orgEditDark: "/assets/dashboard/write-dark.svg",
} as const;

const ProfilePage = () => {
  const { toast } = useToast();

  // ===== API-driven Profile State =====
  const [profile, setProfile] = useState<Profile | null>(null);
  const [triggerGetUserProfile] = useLazyGetUserProfileQuery();
  const [updateUserProfile] = useUpdateUserProfileMutation();

  // ===== Form States =====
  const [orgEditing, setOrgEditing] = useState(false);
  const [orgInput, setOrgInput] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "account";

  const [activeTab, setActiveTab] = useState(defaultTab);

  const orgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await triggerGetUserProfile().unwrap();
        setProfile(data);

        const first = (data.firstName || "").trim();
        const last = (data.lastName || "").trim();
        const name = [first, last].filter(Boolean).join(" ");

        setFullName(name);
        setCountry(data.country || "");
        setOrgInput(data.organization || "");
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Could not fetch profile.";

        toast({
          title: "Error loading profile",
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  useEffect(() => {
    if (orgEditing && orgInputRef.current) {
      orgInputRef.current.focus();
      orgInputRef.current.select();
    }
  }, [orgEditing]);

  const canEditOrg = profile?.role === "owner";

  const fallbackInitials = useMemo(() => {
    if (!profile) return "JD";
    const parts = [profile.firstName, profile.lastName].filter(Boolean);
    return (
      parts
        .map((s) => s.trim().charAt(0).toUpperCase())
        .join("")
        .slice(0, 2) || "JD"
    );
  }, [profile]);

  function parseNameForApi(raw: string): {
    firstName: string;
    lastName: string;
  } {
    const trimmed = raw.trim().replace(/\s+/, " ");
    if (!trimmed) return { firstName: "", lastName: "" };
    const [first, ...rest] = trimmed.split(/\s+/);
    return {
      firstName: first || "",
      lastName: rest.join(" ") || "",
    };
  }

  const handleSave = async () => {
    setSaving(true);

    const { firstName, lastName } = parseNameForApi(fullName);

    const payload: Partial<ApiUser> = {
      firstName,
      lastName,
      country: country ?? "",
    };

    if (canEditOrg) {
      payload.organization = orgInput ?? "";
    }

    Object.keys(payload).forEach((k) => {
      if ((payload as Record<string, unknown>)[k] === "") {
        delete (payload as Record<string, unknown>)[k];
      }
    });

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      toast({
        title: "Nothing to update!",
        description: "No new values to update.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUserProfile(payload).unwrap();

      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved.",
      });

      const data = await triggerGetUserProfile().unwrap();
      setProfile(data);

      const first = (data.firstName || "").trim();
      const last = (data.lastName || "").trim();
      setFullName([first, last].filter(Boolean).join(" "));
      setCountry(data.country || "");
      setOrgInput(data.organization || "");
      setOrgEditing(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save changes.";

      toast({
        title: "Error updating profile",
        description: message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOrgSave = async () => {
    if (!canEditOrg) return;
    setSaving(true);
    try {
      await updateUserProfile({ organization: orgInput }).unwrap();

      const data = await triggerGetUserProfile().unwrap();
      setProfile(data);
      setOrgInput(data.organization || "");
      setOrgEditing(false);

      toast({
        title: "Organization Updated",
        description: "Organization name updated successfully.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not update organization.";

      toast({
        title: "Error updating organization",
        description: message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOrgCancel = () => {
    setOrgEditing(false);
    setOrgInput(profile?.organization || "");
  };

  function prevent(e: React.FormEvent) {
    e.preventDefault();
  }

  const headerTitleClass =
    "text-[32px] font-semibold leading-[42px] tracking-[-0.5px]";
  const headerDescClass =
    "text-[16px] leading-[24px] tracking-[-0.3px] text-muted-foreground";

  const orgTextClass =
    "truncate text-[24px] font-bold leading-8 tracking-[-0.4px] font-['Space_Grotesk']";

  return (
    <DashboardCard
      data-testid="dashboard-profile-page"
      className={cn("relative overflow-hidden p-0", "bg-public-card-bg-dark")}
    >
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          if (v !== "security") setOrgEditing(false);
        }}
        className="w-full"
        variant="glowing"
      >
        <div className="px-6 pt-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              {activeTab === "security" ? (
                <div className="flex min-w-0 items-center gap-3">
                  {orgEditing ? (
                    <form
                      onSubmit={prevent}
                      className="flex w-full flex-wrap items-center gap-2"
                    >
                      <span className={orgTextClass} data-testid="org-prefix">
                        Organization:
                      </span>

                      <Input
                        ref={orgInputRef}
                        value={orgInput}
                        onChange={(e) => setOrgInput(e.target.value)}
                        disabled={saving}
                        className="max-w-xs text-[24px] font-bold leading-8 tracking-[-0.4px]"
                        data-testid="org-input"
                      />

                      <Button
                        size="sm"
                        onClick={handleOrgSave}
                        disabled={saving || !orgInput.trim()}
                        data-testid="org-save"
                        type="button"
                      >
                        Save
                      </Button>

                      <Button
                        size="sm"
                        type="button"
                        variant="secondary"
                        onClick={handleOrgCancel}
                        disabled={saving}
                        data-testid="org-cancel"
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <>
                      <span className={orgTextClass} data-testid="org-label">
                        {profile?.organization || ""}
                      </span>

                      {canEditOrg && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0"
                          aria-label="Edit Organization"
                          onClick={() => setOrgEditing(true)}
                          data-testid="org-edit"
                          type="button"
                        >
                          {/* Light icon */}
                          <img
                            src={ICONS.orgEditLight}
                            alt=""
                            aria-hidden
                            className="h-5 w-5 dark:hidden"
                          />
                          {/* Dark icon */}
                          <img
                            src={ICONS.orgEditDark}
                            alt=""
                            aria-hidden
                            className="hidden h-5 w-5 dark:block"
                          />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p
                    className={headerTitleClass}
                    data-testid="profile-information-heading"
                  >
                    Profile Information
                  </p>
                  <p className={headerDescClass}>
                    Update your personal details
                  </p>
                </div>
              )}
            </div>

            <div className="overflow-x-auto px-1 py-1">
              <TabsList>
                <TabsTrigger value="account">
                  <UserRound className="h-[18px] w-[18px] shrink-0" />
                  Account
                </TabsTrigger>

                <TabsTrigger value="security">
                  <ShieldCheck className="h-[18px] w-[18px] shrink-0" />
                  Security
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <TabsContent value="account" className="m-0 space-y-6">
            <ProfileAccountTab
              profile={profile}
              setProfile={setProfile}
              loading={loading}
              saving={saving}
              fullName={fullName}
              setFullName={setFullName}
              country={country}
              setCountry={setCountry}
              fallbackInitials={fallbackInitials}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="security" className="m-0 space-y-6">
            <ProfileSecurityTab />
          </TabsContent>
        </div>
      </Tabs>
    </DashboardCard>
  );
};

export default ProfilePage;
