"use client";

import SecurityQuestionDialog from "../_components/security-question-dialog";
import MfaMethodDialog from "../_components/MfaMethodDialog";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter  
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Mail,
  Key,
  Shield,
  AlertTriangle,
  Smartphone,
  QrCode,
  Edit2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { getUserProfile, updateUserProfile } from "@/api/profileManagement"; 


import {updatePassword } from "aws-amplify/auth";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import MfaTotpDialog from "@/app/dashboard/_components/MfaTotpDialog";
import { fetchActiveSessions, SmartPCSession } from "@/api/session";
import { fetchUserAttributes, updateMFAPreference } from "aws-amplify/auth";

import { fetchMFAPreference } from "aws-amplify/auth"; 
import { useSearchParams } from "next/navigation";

const ProfilePage = () => {
  const { toast } = useToast();
  // ===== API-driven Profile State =====
  const [profile, setProfile] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    country: string;
    organization: string;
    role: string;
  } | null>(null);

  // ===== Form States =====
  const [showTotpDialog, setShowTotpDialog] = useState(false);
  const [orgEditing, setOrgEditing] = useState(false);
  const [orgInput, setOrgInput] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "account";
  

  const orgInputRef = useRef<HTMLInputElement>(null);

  // Security & 2FA/session states
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const [sessions, setSessions] = useState<SmartPCSession[]>([]);

  const [mfaMethod, setMfaMethod] = useState<"app" | "sms" | "email" | null>(
    null
  );

  const [cooldown, setCooldown] = useState(0);

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [isEmailMFAEnabled, setIsEmailMFAEnabled] = useState(false);



  
  // ===== Profile & Org Data Fetch/Sync =====
  useEffect(() => {


    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getUserProfile();
        setProfile(data);

        const first = (data.firstName || "").trim();
        const last = (data.lastName || "").trim();
        const name = [first, last].filter(Boolean).join(" ");
        setFullName(name);
        setCountry(data.country || "");
        setOrgInput(data.organization || "");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not fetch profile.";

        toast({
          title: "Error loading profile",
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    
    // eslint-disable-next-line
  }, []);
  const [isFederatedUser, setIsFederatedUser] = useState(false);
  useEffect(() => {
  const fetchSessions = async () => {
    const data = await fetchActiveSessions();
    setSessions(data);
  };

  fetchSessions();
}, []);

  useEffect(() => {
  const checkFederatedStatus = async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      if (!idToken) return;

      const decoded = JSON.parse(atob(idToken.split(".")[1]));
      const isFederated =
        Array.isArray(decoded?.identities) &&
        decoded.identities.some((id: any) =>
          ["google", "apple"].includes(id.providerType?.toLowerCase())
        );
      setIsFederatedUser(isFederated);
    } catch (err) {
      console.error("Failed to decode token for federated check:", err);
    }
  };

  checkFederatedStatus();
}, []);


useEffect(() => {
  const checkMFAPreference = async () => {
    try {
      const result = await fetchMFAPreference();
      console.log("MFA preference result:", result);

      const isTOTPEnabled = result.enabled?.includes("TOTP") || result.preferred === "TOTP";
      const isEmailEnabled = result.enabled?.includes("EMAIL") || result.preferred === "EMAIL";

      setIs2FAEnabled(isTOTPEnabled);
      setIsEmailMFAEnabled(isEmailEnabled);
    } catch (err) {
      setIs2FAEnabled(false);
      setIsEmailMFAEnabled(false);
    }
  };

  checkMFAPreference();
}, []);

const handleToggleEmailMFA = async () => {
  try {
    const newStatus = !isEmailMFAEnabled;
    await updateMFAPreference({
        email: newStatus ? "NOT_PREFERRED" : "DISABLED",
        totp: is2FAEnabled ? "NOT_PREFERRED" : "DISABLED",
      });

    setIsEmailMFAEnabled(newStatus);
    toast({
      title: `Email MFA ${newStatus ? "Enabled" : "Disabled"}`,
      description: `Email-based multi-factor authentication has been ${newStatus ? "enabled" : "disabled"}.`,
    });
  } catch (err) {
    toast({
      title: "Error updating Email MFA",
      description: err instanceof Error ? err.message : "Something went wrong",
      variant: "destructive",
    });
  }
};


  useEffect(() => {
    if (orgEditing && orgInputRef.current) {
      orgInputRef.current.focus();
      orgInputRef.current.select();
    }
  }, [orgEditing]);

  // ===== Permission Computed Value =====
  const canEditOrg = profile?.role === "owner";

  // ===== Avatar Initials =====
  const fallbackInitials = (() => {
    if (!profile) return "JD";
    const parts = [profile.firstName, profile.lastName].filter(Boolean);
    return parts
      .map((s) => s.trim().charAt(0).toUpperCase())
      .join("")
      .slice(0, 2) || "JD";
  })();

  // ===== Full Name (for API) Processing =====
  function parseNameForApi(raw: string): { firstName: string; lastName: string } {
    const trimmed = raw.trim().replace(/\s+/, " ");
    if (!trimmed) return { firstName: "", lastName: "" };
    const [first, ...rest] = trimmed.split(/\s+/);
    return {
      firstName: first || "",
      lastName: rest.join(" ") || "",
    };
  }

  // ===== Profile Save =====
  const handleSave = async () => {
    setSaving(true);
    const { firstName, lastName } = parseNameForApi(fullName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      firstName,
      lastName,
      country: country ?? "",
    };
    if (canEditOrg) {
      payload.organization = orgInput ?? "";
    }

    Object.keys(payload).forEach(
      (k) => payload[k] === "" && delete payload[k]
    );

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      return toast({
        title: "Nothing to update!",
        description: "No new values to update.",
        variant: "destructive",
      });
    }

    try {
      await updateUserProfile(payload);
      toast({
        title: "Profile Updated",
        description: `Your profile changes have been saved.`,
      });
      const data = await getUserProfile();
      setProfile(data);
      const first = (data.firstName || "").trim();
      const last = (data.lastName || "").trim();
      setFullName([first, last].filter(Boolean).join(" "));
      setCountry(data.country || "");
      setOrgInput(data.organization || "");
      setOrgEditing(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save changes.";

      toast({
        title: "Error updating profile",
        description: message,
      });
    }
    setSaving(false);
  };

  // ===== Org Inline Save =====
  const handleOrgSave = async () => {
    if (!canEditOrg) return;
    setSaving(true);
    try {
      await updateUserProfile({ organization: orgInput });
      const data = await getUserProfile();
      setProfile(data);
      setOrgInput(data.organization || "");
      setOrgEditing(false);
      toast({
        title: "Organization Updated",
        description: "Organization name updated successfully.",
      });
    } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Could not update organization.";

        toast({
          title: "Error updating organization",
          description: message,
        });
      }
    setSaving(false);
  };

  // ===== Org Inline Cancel =====
  const handleOrgCancel = () => {
    setOrgEditing(false);
    setOrgInput(profile?.organization || "");
  };

  // ===== Prevent Default Submit =====
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function prevent(e: any) {
    e.preventDefault();
  }

  // ===== Security/2FA Logic (Unchanged) =====
  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        if (mounted) {
          setCooldown((prev) => {
            if (prev <= 0) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const complete2FASetup = () => {
    setIs2FAEnabled(true);
    setShow2FADialog(false);
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been successfully enabled.",
    });
  };
 const handleDisableTotp = async () => {
  try {
    await updateMFAPreference({
      totp: "DISABLED",
    });

    setIs2FAEnabled(false);

    toast({
      title: "TOTP Disabled",
      description: "Authenticator App MFA has been turned off.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to disable TOTP.";
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }
};


  const handleMFAMethodChange = (method: "app" | "sms" | "email") => {
    setMfaMethod(method);
    setShow2FADialog(true);
  };

  // ===== Main Render =====
  return (
    <div className="space-y-6">
      {/* --- Organization Name Banner --- */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex-1 flex items-center">
          {orgEditing ? (
            <form onSubmit={prevent} className="flex items-center gap-2 w-full">
              <Input
                ref={orgInputRef}
                value={orgInput}
                onChange={(e) => setOrgInput(e.target.value)}
                disabled={saving}
                className="text-2xl font-bold max-w-xs"
                style={{ fontSize: "2rem" }}
                data-testid="org-input"
              />
              <Button
                size="sm"
                onClick={handleOrgSave}
                disabled={saving || !orgInput.trim()}
                data-testid="org-save"
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
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ lineHeight: "1.2" }}
              data-testid="org-label"
            >
              {profile?.organization || (
                <span className="text-muted">Organization</span>
              )}
            </span>
          )}

          {canEditOrg && !orgEditing && (
            <Button
              size="icon"
              variant="ghost"
              className="ml-2"
              aria-label="Edit Organization"
              onClick={() => setOrgEditing(true)}
              data-testid="org-edit"
            >
              <Edit2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* --- Tabs Content: Account/Security --- */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* -------- ACCOUNT TAB -------- */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/avatar-placeholder.jpg" alt="User" />
                    <AvatarFallback className="text-xl">
                      {fallbackInitials}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 flex-1">
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
                {/* Full name */}
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
                {/* Country */}
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
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed. Please contact support if you need
                    to update your email address.
                  </p>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={loading || saving}
                  type="button"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- SECURITY TAB -------- */}
        <TabsContent value="security" className="space-y-6">
          {/* ----- Change Password Card ----- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>
                {isFederatedUser
                  ? "This account was created with Google or Apple Sign-In."
                  : "You’ve set a password for your Sense PC account."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isFederatedUser ? (
                <div className="text-sm text-muted-foreground">
                  This account was created using Google or Apple. You don’t need a password to sign in.
                </div>
              ) : !showPasswordForm ? (
                <div className="text-sm text-muted-foreground">
                  <Button
                    variant="link"
                    className="px-0 mt-2 text-sm"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Change password
                  </Button>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (newPassword !== confirmPassword) {
                      toast({
                        title: "Passwords do not match",
                        description: "Please re-enter the same new password.",
                        variant: "destructive",
                      });
                      return;
                    }

                    setChangingPassword(true);
                    try {
                      await updatePassword({
                        oldPassword: currentPassword,
                        newPassword: newPassword,
                      });

                      toast({
                        title: "Password Changed",
                        description: "You can now log out and log back in with your new password.",
                      });
                    } catch (err) {
                      const message =
                        err instanceof Error
                          ? err.message
                          : "Failed to change password.";
                      toast({
                        title: "Error",
                        description: message,
                        variant: "destructive",
                      });
                    } finally {
                      setChangingPassword(false);
                    }
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long and include a number or symbol.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm">Re-enter New Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={changingPassword}>
                      {changingPassword ? "Updating..." : "Confirm"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* ----- Security Question Card ----- */}
          <Card>
            <CardHeader>
              <CardTitle>Security Question</CardTitle>
              <CardDescription>
                Set or update your account recovery security question.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Setting up a security question adds an extra layer of protection for actions like changing your password or configuring multi-factor authentication.
              </p>
              <Button size="sm" onClick={() => setShowSecurityDialog(true)}>
                Edit
              </Button>
            </CardContent>
          </Card>
          <SecurityQuestionDialog open={showSecurityDialog} onClose={() => setShowSecurityDialog(false)} />

          {/* ----- Multi-Factor Auth Card ----- */}
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Choose your preferred authentication method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">
                    {is2FAEnabled
                      ? "Two-factor authentication is enabled"
                      : "Use an authenticator app to generate one-time codes"}
                  </p>
                </div>
               <Button
                  variant={is2FAEnabled ? "destructive" : "outline"}
                  onClick={() => {
                    if (is2FAEnabled) {
                      handleDisableTotp();
                    } else {
                      setShowTotpDialog(true);
                    }
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {is2FAEnabled ? "Disable" : "Setup"}
                </Button>


                  <MfaTotpDialog
                    open={showTotpDialog}
                    onClose={() => setShowTotpDialog(false)}
                  onComplete={async () => {
                      setShowTotpDialog(false);
                      try {
                           // Tell Cognito: TOTP is ENABLED, and set as PREFERRED
                          await updateMFAPreference({
                            totp: "NOT_PREFERRED",
                            email: isEmailMFAEnabled ? "NOT_PREFERRED" : "DISABLED"
                          });
                        const result = await fetchMFAPreference();
                        console.log("MFA preference result (onComplete):", result);

                        const isTOTPEnabled = result.enabled?.includes("TOTP") || result.preferred === "TOTP";
                        setIs2FAEnabled(isTOTPEnabled);
                      } catch (err) {
                        console.error("Error fetching MFA (onComplete):", err);
                      }
                    }}



                  />
              </div>
        
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Email Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Receive codes via email
                  </p>
                </div>
               <Button
                variant={isEmailMFAEnabled ? "destructive" : "outline"}
                onClick={handleToggleEmailMFA}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isEmailMFAEnabled ? "Disable" : "Setup"}
              </Button>

              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-2">
                      {session.deviceName || "Unknown Device"}
                      {session.isCurrentSession && (
                        <span className="text-green-600 dark:text-green-400 text-xs font-semibold">
                          THIS DEVICE
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Last Activity{" "}
                      {session.lastSeen
                        ? new Date(session.lastSeen).toLocaleString()
                        : "Unknown"}
                      {session.location?.city || session.location?.country
                        ? ` • ${session.location?.city || "Unknown"}, ${session.location?.country || session.location?.region || ""}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>

            <CardFooter className="justify-end">
              <form action="/api/auth/global-signout" method="POST">
                <Button type="submit" variant="destructive" size="sm">
                  Sign Out from All Devices
                </Button>
              </form>
            </CardFooter>
          </Card>


        </TabsContent>
      </Tabs>

      {/* 2FA Dialog */}
      <MfaMethodDialog
        open={show2FADialog}
        onClose={() => setShow2FADialog(false)}
        method={mfaMethod}
        onComplete={complete2FASetup}
      />

    </div>
  );
};

export default ProfilePage;