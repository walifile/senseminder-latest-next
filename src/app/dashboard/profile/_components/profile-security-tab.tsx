
"use client";

import type { SmartPCSession } from "@/api/session";

import { routes } from "@/constants/routes";
import React, { useState, useEffect } from "react";
import { fetchActiveSessions } from "@/api/session";
import MfaTotpDialog from "@/app/dashboard/_components/MfaTotpDialog";
import MfaMethodDialog from "@/app/dashboard/_components/MfaMethodDialog";
import SecurityQuestionDialog from "@/app/dashboard/_components/security-question-dialog";

import { Logger } from "@/lib/utils/logger";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";

import {
  signOut,
  updatePassword,
  fetchAuthSession,
  fetchMFAPreference,
  updateMFAPreference,
} from "aws-amplify/auth";

import { useToast } from "@/hooks/use-toast";


const ICONS = {
  password: "/assets/dashboard/password.svg",
  securityQuestion: "/assets/dashboard/security.svg",
  mfa: "/assets/dashboard/mfa.svg",
  mfaAuthenticator: "/assets/dashboard/authenticator.svg",
  mfaEmail: "/assets/dashboard/emailmfa.svg",
  connectedDevices: "/assets/dashboard/connector.svg",
} as const;

const getClientTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

const toDateSafe = (value: unknown): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  // number: could be seconds or milliseconds
  if (typeof value === "number") {
    const ms = value < 1_000_000_000_000 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // string: could be ISO or numeric epoch
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;

    if (/^\d+$/.test(s)) {
      const n = Number(s);
      const ms = n < 1_000_000_000_000 ? n * 1000 : n;
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const formatLastActivity = (value: unknown): string => {
  const d = toDateSafe(value);
  if (!d) return "Unknown";

  const tz = getClientTimeZone();

  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(d);
  }
};

export const ProfileSecurityTab = () => {
  const { toast } = useToast();

  // Security & 2FA/session states
  const [sessions, setSessions] = useState<SmartPCSession[]>([]);
  const [isFederatedUser, setIsFederatedUser] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showSecurityDialog, setShowSecurityDialog] = useState(false);

  const [showTotpDialog, setShowTotpDialog] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isEmailMFAEnabled, setIsEmailMFAEnabled] = useState(false);

  // (kept as-is, even if currently not triggered by UI)
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [mfaMethod] = useState<"app" | "sms" | "email" | null>(null);
  const [cooldown, setCooldown] = useState(0);

  async function handleGlobalSignOut() {
    try {
      await signOut({ global: true });
      window.location.href = routes.auth;
    } catch (err) {
      Logger.error("Global sign-out failed:", err);
    }
  }

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
          decoded.identities.some((id: { providerType: string }) =>
            ["google", "apple"].includes(id.providerType?.toLowerCase())
          );

        setIsFederatedUser(isFederated);
      } catch (err) {
        Logger.error("Failed to decode token for federated check:", err);
      }
    };

    checkFederatedStatus();
  }, []);

  useEffect(() => {
    const checkMFAPreference = async () => {
      try {
        const result = await fetchMFAPreference();
        Logger.log("MFA preference result:", result);

        const isTOTPEnabled =
          result.enabled?.includes("TOTP") || result.preferred === "TOTP";
        const isEmailEnabled =
          result.enabled?.includes("EMAIL") || result.preferred === "EMAIL";

        setIs2FAEnabled(isTOTPEnabled);
        setIsEmailMFAEnabled(isEmailEnabled);
      } catch {
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
        description: `Email-based multi-factor authentication has been ${
          newStatus ? "enabled" : "disabled"
        }.`,
      });
    } catch (err) {
      toast({
        title: "Error updating Email MFA",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
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

  // Figma-like card styles (still using DashboardCard)
  const primaryCardClass =
    "rounded-[10px] border border-[rgba(37,48,240,0.10)] bg-[rgba(37,48,240,0.07)] p-5 dark:bg-[rgba(255,255,255,0.03)] dark:border-[rgba(255,255,255,0.08)]";

  const sectionTitleClass =
    "text-[20px] font-semibold leading-[30px] tracking-[-0.3px]";

  const sectionDescClass =
    "text-[16px] leading-[24px] tracking-[-0.3px] text-muted-foreground";

  const optionCardClass =
    "rounded-[10px] border border-[rgba(37,48,240,0.07)] bg-[rgba(255,255,255,0.50)] p-6 dark:bg-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.10)]";

  const TitleWithIcon = ({
    iconSrc,
    title,
  }: {
    iconSrc: string;
    title: string;
  }) => (
    <div className="flex items-center gap-3">
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          className="h-5 w-5 shrink-0"
          aria-hidden
        />
      ) : null}
      <p className={sectionTitleClass}>{title}</p>
    </div>
  );

  return (
    <>
      <div
        data-testid="dashboard-profile-security-tab"
        className="space-y-6"
      >
        {/* Row 1: Password + Security Question */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Password */}
          <DashboardCard className={primaryCardClass}>
            <div className="space-y-4">
              <div className="space-y-1">
                <TitleWithIcon iconSrc={ICONS.password} title="Password" />

                <p className={sectionDescClass}>
                  {isFederatedUser
                    ? "This account was created with Google or Apple Sign-In."
                    : "You’ve set a password for your Sense PC account."}
                </p>
              </div>

              {isFederatedUser ? (
                <p className={sectionDescClass}>
                  This account was created using Google or Apple. You don’t need
                  a password to sign in.
                </p>
              ) : !showPasswordForm ? (
                <div>
                  <Button
                    size="sm"
                    onClick={() => setShowPasswordForm(true)}
                    type="button"
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
                        newPassword,
                      });

                      toast({
                        title: "Password Changed",
                        description:
                          "You can now log out and log back in with your new password.",
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
                      Must be at least 8 characters long and include a number or
                      symbol.
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
                      variant="outline"
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
            </div>
          </DashboardCard>

          {/* Security Question */}
          <DashboardCard className={primaryCardClass}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <TitleWithIcon
                    iconSrc={ICONS.securityQuestion}
                    title="Security Question"
                  />
                  <p className={sectionDescClass}>
                    Set or update your account recovery security question.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setShowSecurityDialog(true)}
                  type="button"
                >
                  Edit
                </Button>
              </div>

              <p className={sectionDescClass}>
                Setting up a security question adds an extra layer of protection
                for actions like changing your password or configuring multi-factor
                authentication.
              </p>
            </div>
          </DashboardCard>
        </div>

        <SecurityQuestionDialog
          open={showSecurityDialog}
          onClose={() => setShowSecurityDialog(false)}
        />

        {/* MFA */}
        <DashboardCard className="rounded-[10px] border border-[rgba(37,48,240,0.10)] bg-[rgba(37,48,240,0.07)] p-6 dark:bg-[rgba(255,255,255,0.03)] dark:border-[rgba(255,255,255,0.08)]">
          <div className="space-y-4">
            <div className="space-y-1">
              <TitleWithIcon
                iconSrc={ICONS.mfa}
                title="Multi-Factor Authentication"
              />
              <p className={sectionDescClass}>
                Choose your preferred authentication method
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Authenticator App option */}
              <DashboardCard className={optionCardClass}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-[22px]"
                     
                      aria-hidden
                    >
                      {ICONS.mfaAuthenticator ? (
                        <img
                          src={ICONS.mfaAuthenticator}
                          alt=""
                          aria-hidden
                        />
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <p className="text-[16px] font-medium leading-[24px] tracking-[-0.3px]">
                        Authenticator App
                      </p>
                      <p className="text-[14px] leading-[20px] tracking-[-0.2px] text-muted-foreground">
                        {is2FAEnabled
                          ? "Two-factor authentication is enabled"
                          : "Use an authenticator app to generate one-time codes"}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={is2FAEnabled ? "destructive" : "default"}
                    onClick={() => {
                      if (is2FAEnabled) handleDisableTotp();
                      else setShowTotpDialog(true);
                    }}
                    type="button"
                  >
                    {is2FAEnabled ? "Disable" : "Setup"}
                  </Button>

                  <MfaTotpDialog
                    open={showTotpDialog}
                    onClose={() => setShowTotpDialog(false)}
                    onComplete={async () => {
                      setShowTotpDialog(false);
                      try {
                        await updateMFAPreference({
                          totp: "NOT_PREFERRED",
                          email: isEmailMFAEnabled ? "NOT_PREFERRED" : "DISABLED",
                        });

                        const result = await fetchMFAPreference();
                        Logger.log("MFA preference result (onComplete):", result);

                        const isTOTPEnabled =
                          result.enabled?.includes("TOTP") ||
                          result.preferred === "TOTP";

                        setIs2FAEnabled(isTOTPEnabled);
                      } catch (err) {
                        Logger.error("Error fetching MFA (onComplete):", err);
                      }
                    }}
                  />
                </div>
              </DashboardCard>

              {/* Email Authentication option */}
              <DashboardCard className={optionCardClass}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-[22px]"
                     
                      aria-hidden
                    >
                      {ICONS.mfaEmail ? (
                        <img
                          src={ICONS.mfaEmail}
                          aria-hidden
                        />
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <p className="text-[16px] font-medium leading-[24px] tracking-[-0.3px]">
                        Email Authentication
                      </p>
                      <p className="text-[14px] leading-[20px] tracking-[-0.2px] text-muted-foreground">
                        Receive codes via email
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isEmailMFAEnabled ? "destructive" : "default"}
                    onClick={handleToggleEmailMFA}
                    type="button"
                  >
                    {isEmailMFAEnabled ? "Disable" : "Setup"}
                  </Button>
                </div>
              </DashboardCard>
            </div>
          </div>
        </DashboardCard>

        {/* Connected Devices */}
        <DashboardCard className="rounded-[10px] border border-[rgba(37,48,240,0.10)] bg-[rgba(37,48,240,0.07)] p-6 dark:bg-[rgba(255,255,255,0.03)] dark:border-[rgba(255,255,255,0.08)]">
          <div className="flex h-full flex-col gap-4">
            <TitleWithIcon
              iconSrc={ICONS.connectedDevices}
              title="Connected Devices"
            />

            {/* Keep backend-driven list */}
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {session.deviceName || "Unknown Device"}
                      {session.isCurrentSession && (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                          THIS DEVICE
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Last Activity {formatLastActivity(session.lastSeen)}
                      {session.location?.city || session.location?.country
                        ? ` • ${session.location?.city || "Unknown"}, ${
                            session.location?.country || session.location?.region || ""
                          }`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Button bottom-right */}
            <div className="mt-auto flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleGlobalSignOut}
                type="button"
              >
                Sign Out from All Devices
              </Button>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* (kept, unchanged) */}
      <MfaMethodDialog
        open={show2FADialog}
        onClose={() => setShow2FADialog(false)}
        method={mfaMethod}
        onComplete={complete2FASetup}
      />
    </>
  );
};
