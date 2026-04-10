
"use client";

import { useSearchParams } from "next/navigation";
import React, { useRef, useMemo, useState, useEffect } from "react";
import {
  type UserProfile,
  useLazyGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/api/profileManagement";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

import { UserRound, ShieldCheck } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { ProfileAccountTab } from "./_components/profile-account-tab";
import { ProfileSecurityTab } from "./_components/profile-security-tab";

import type { ApiUser } from "../users/types";

const ICONS = {
  orgEditLight: "/assets/dashboard/write-light.svg",
  orgEditDark: "/assets/dashboard/write-dark.svg",
} as const;

const PROFILE_NAME_MAX_LENGTH = 40;
const ORGANIZATION_MAX_LENGTH = 40;

const ProfilePage = () => {
  const { toast } = useToast();

  // ===== API-driven Profile State =====
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

        setFullName(name.slice(0, PROFILE_NAME_MAX_LENGTH));
        setCountry(data.country || "");
        setOrgInput((data.organization || "").slice(0, ORGANIZATION_MAX_LENGTH));
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
        .map((s) => (s ?? "").trim().charAt(0).toUpperCase())
        .join("")
        .slice(0, 2) || "JD"
    );
  }, [profile]);

  function parseNameForApi(raw: string): {
    firstName: string;
    lastName: string;
  } {
    const trimmed = raw
      .slice(0, PROFILE_NAME_MAX_LENGTH)
      .trim()
      .replace(/\s+/g, " ");
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
      payload.organization = (orgInput ?? "").slice(0, ORGANIZATION_MAX_LENGTH);
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
      setFullName(
        [first, last]
          .filter(Boolean)
          .join(" ")
          .slice(0, PROFILE_NAME_MAX_LENGTH)
      );
      setCountry(data.country || "");
      setOrgInput((data.organization || "").slice(0, ORGANIZATION_MAX_LENGTH));
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
      await updateUserProfile({
        organization: orgInput.slice(0, ORGANIZATION_MAX_LENGTH),
      }).unwrap();

      const data = await triggerGetUserProfile().unwrap();
      setProfile(data);
      setOrgInput((data.organization || "").slice(0, ORGANIZATION_MAX_LENGTH));
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
    "block min-w-0 max-w-full break-all text-[18px] font-bold leading-6 tracking-[-0.3px] font-['Space_Grotesk'] sm:text-[24px] sm:leading-8 sm:break-words";
  const organizationName = (profile?.organization || "").trim();
  const hasOrganizationName = organizationName.length > 0;

  const organizationTypeBadge = useMemo(() => {
    if (typeof profile?.isBusiness !== "boolean") return null;

    return profile.isBusiness
      ? {
          label: "Business",
          className:
            "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15",
        }
      : {
          label: "Personal",
          className:
            "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-50 dark:border-slate-400/40 dark:bg-slate-500/10 dark:text-slate-200 dark:hover:bg-slate-500/10",
        };
  }, [profile?.isBusiness]);

  return (
    <DashboardCard
      data-testid="dashboard-profile-page"
      className={cn("relative overflow-hidden p-0", "bg-public-card-bg-dark")}
    >
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          if (v !== "account") setOrgEditing(false);
        }}
        className="w-full"
        variant="glowing"
      >
        <div className="px-4 pt-4 sm:px-6 sm:pt-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              {activeTab === "account" ? (
                <div className="min-w-0 space-y-1">
                  <p
                    className="text-sm leading-5 text-muted-foreground"
                    data-testid="org-title"
                  >
                    Organization
                  </p>
                  {orgEditing ? (
                    <form
                      onSubmit={prevent}
                      className="flex w-full flex-wrap items-center gap-2"
                    >
                      <Input
                        ref={orgInputRef}
                        value={orgInput}
                        onChange={(e) =>
                          setOrgInput(
                            e.target.value.slice(0, ORGANIZATION_MAX_LENGTH)
                          )
                        }
                        maxLength={ORGANIZATION_MAX_LENGTH}
                        disabled={saving}
                        placeholder="Organization name"
                        className="w-full max-w-full text-[20px] font-bold leading-7 tracking-[-0.3px] sm:max-w-xs sm:text-[24px] sm:leading-8 sm:tracking-[-0.4px]"
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
                    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                      {hasOrganizationName ? (
                        <div className="flex min-w-0 w-full max-w-full items-center gap-1.5 sm:w-auto sm:gap-2">
                          <span
                            className={cn("min-w-0 max-w-full", orgTextClass)}
                            data-testid="org-label"
                          >
                            {organizationName}
                          </span>
                          {canEditOrg && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0"
                              aria-label="Edit Organization"
                              onClick={() => setOrgEditing(true)}
                              data-testid="org-edit"
                              type="button"
                            >
                              <img
                                src={ICONS.orgEditLight}
                                alt=""
                                aria-hidden
                                className="h-5 w-5 dark:hidden"
                              />
                              <img
                                src={ICONS.orgEditDark}
                                alt=""
                                aria-hidden
                                className="hidden h-5 w-5 dark:block"
                              />
                            </Button>
                          )}
                        </div>
                      ) : canEditOrg ? (
                        <Button
                          variant="link"
                          className="h-auto max-w-full whitespace-normal p-0 text-left text-base"
                          onClick={() => setOrgEditing(true)}
                          data-testid="org-set-name-link"
                          type="button"
                        >
                          Set Organization Name
                        </Button>
                      ) : (
                        <span
                          className="text-base font-medium text-muted-foreground"
                          data-testid="org-unnamed-label"
                        >
                          Unnamed Organization
                        </span>
                      )}
                      {organizationTypeBadge && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "max-w-full shrink-0",
                            organizationTypeBadge.className
                          )}
                          data-testid="org-type-badge"
                        >
                          {organizationTypeBadge.label}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p
                    className={headerTitleClass}
                    data-testid="profile-security-heading"
                  >
                    Security
                  </p>
                  <p className={headerDescClass}>
                    Manage your account security settings
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

        <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          <TabsContent value="account" className="m-0 space-y-6">
            <ProfileAccountTab
              profile={profile}
              setProfile={setProfile}
              loading={loading}
              saving={saving}
              fullName={fullName}
              fullNameMaxLength={PROFILE_NAME_MAX_LENGTH}
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
