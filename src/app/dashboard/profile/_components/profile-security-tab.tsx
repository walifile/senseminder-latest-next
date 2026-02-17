"use client";

import type { SmartPCSession } from "@/api/session";

import { routes } from "@/constants/routes";
import React, { useState, useEffect } from "react";
import { useLazyFetchActiveSessionsQuery } from "@/api/session";
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

import {
  formatLastActivity,
  isFederatedIdToken,
  getChangePasswordErrorMessage,
} from "../utils";

const ICONS = {
  password: "/assets/dashboard/password.svg",
  securityQuestion: "/assets/dashboard/security.svg",
  mfa: "/assets/dashboard/mfa.svg",
  mfaAuthenticator: "/assets/dashboard/authenticator.svg",
  mfaEmail: "/assets/dashboard/emailmfa.svg",
  connectedDevices: "/assets/dashboard/connector.svg",
} as const;


export const ProfileSecurityTab = () => {
  const { toast } = useToast();

  // Security & 2FA/session states
  const [sessions, setSessions] = useState<SmartPCSession[]>([]);
  const [triggerFetchActiveSessions] = useLazyFetchActiveSessionsQuery();
  const [isFederatedUser, setIsFederatedUser] = useState(false);
  const isMfaSupported = !isFederatedUser;


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
      const data = await triggerFetchActiveSessions().unwrap();
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

        setIsFederatedUser(isFederatedIdToken(idToken));
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
    "rounded-[10px] border border-brand-blue-10 bg-brand-blue-07 p-5 dark:bg-public-card-bg-dark dark:border-border-white-08";


  const sectionTitleClass =
    "text-[20px] font-semibold leading-[30px] tracking-[-0.3px] font-['Space_Grotesk']";

  const sectionDescClass =
    "text-[16px] leading-[24px] tracking-[-0.3px] text-muted-foreground font-['Space_Grotesk']";
  const optionCardClass =
    "rounded-[10px] border border-brand-blue-07 !bg-surface-white-75 p-6 backdrop-blur-[2px] dark:!bg-public-card-bg-dark dark:border-border-white-10";


  const TitleWithIcon = ({
    iconSrc,
    title,
  }: {
    iconSrc: string;
    title: string;
  }) => (
    <div className="flex items-center gap-3 font-['Space_Grotesk']">
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
        className="space-y-6 font-['Space_Grotesk']"
      >
        {/* Row 1: Password + Security Question */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Password */}
          <DashboardCard className={`${primaryCardClass} font-['Space_Grotesk']`}>
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
                    data-testid="security-change-password-button"
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
                        toast({
                          title: "Unable to change password",
                          description: getChangePasswordErrorMessage(err),
                          variant: "destructive",
                        });
                      } finally {

                      setChangingPassword(false);
                    }
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="current" className="font-['Space_Grotesk']">
                      Current Password
                    </Label>
                    <Input
                      id="current"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      data-testid="security-current-password-input"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new" className="font-['Space_Grotesk']">
                      New Password
                    </Label>
                    <Input
                      id="new"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      data-testid="security-new-password-input"
                    />
                    <p className="text-xs text-muted-foreground font-['Space_Grotesk']">
                      Must be at least 8 characters long and include a number or
                      symbol.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm" className="font-['Space_Grotesk']">
                      Re-enter New Password
                    </Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      data-testid="security-confirm-password-input"
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

                    <Button
                      type="submit"
                      disabled={changingPassword}
                      data-testid="security-confirm-change-password-button"
                    >
                      {changingPassword ? "Updating..." : "Confirm"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </DashboardCard>

          {/* Security Question */}
          <DashboardCard className={`${primaryCardClass} font-['Space_Grotesk']`}>
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
        <DashboardCard className="rounded-[10px] border border-brand-blue-10 bg-brand-blue-07 p-6 dark:bg-public-card-bg-dark dark:border-border-white-08 font-['Space_Grotesk']">
          <div className="space-y-4">
            <div className="space-y-1">
              <TitleWithIcon
                iconSrc={ICONS.mfa}
                title="Multi-Factor Authentication"
              />
              <p className={sectionDescClass}>
                Choose your preferred authentication method
              </p>
              {isFederatedUser ? (
                <p className="text-sm text-muted-foreground">
                  MFA setup is not available for accounts created with Google/Apple sign-in.
                </p>
              ) : null}
            </div>

           <div className="grid gap-6 lg:grid-cols-2">
            {/* Authenticator App option */}
            <DashboardCard className={`${optionCardClass} font-['Space_Grotesk']`}>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-start gap-3 sm:items-center">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[22px]"
                    aria-hidden
                  >
                    {ICONS.mfaAuthenticator ? (
                      <img src={ICONS.mfaAuthenticator} alt="" aria-hidden />
                    ) : null}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-[16px] font-medium leading-[24px] tracking-[-0.3px] font-['Space_Grotesk']">
                      Authenticator App
                    </p>
                    <p className="break-words text-[14px] leading-[20px] tracking-[-0.2px] text-muted-foreground font-['Space_Grotesk']">
                      {is2FAEnabled
                        ? "Two-factor authentication is enabled"
                        : "Use an authenticator app to generate one-time codes"}
                    </p>
                  </div>
                </div>

                <div className="sm:justify-self-end">
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    variant={is2FAEnabled ? "destructive" : "default"}
                    disabled={!isMfaSupported}
                    onClick={() => {
                      if (!isMfaSupported) {
                        toast({
                          title: "Not available",
                          description:
                            "MFA setup is not supported for Google/Apple sign-in accounts.",
                          variant: "destructive",
                        });
                        return;
                      }

                      if (is2FAEnabled) handleDisableTotp();
                      else setShowTotpDialog(true);
                    }}
                    type="button"
                    data-testid={
                      is2FAEnabled
                        ? "security-disable-button"
                        : "security-setup-authenticator-button"
                    }
                  >
                    <span data-testid="dashboard-setup-authenticator-button">
                      {is2FAEnabled ? "Disable" : "Setup"}
                    </span>
                  </Button>
                </div>
              </div>

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
                      result.enabled?.includes("TOTP") || result.preferred === "TOTP";

                    setIs2FAEnabled(isTOTPEnabled);
                  } catch (err) {
                    Logger.error("Error fetching MFA (onComplete):", err);
                  }
                }}
              />
            </DashboardCard>

            {/* Email Authentication option */}
            <DashboardCard className={`${optionCardClass} font-['Space_Grotesk']`}>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-start gap-3 sm:items-center">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[22px]"
                    aria-hidden
                  >
                    {ICONS.mfaEmail ? <img src={ICONS.mfaEmail} alt="" aria-hidden /> : null}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-[16px] font-medium leading-[24px] tracking-[-0.3px] font-['Space_Grotesk']">
                      Email Authentication
                    </p>
                    <p className="text-[14px] leading-[20px] tracking-[-0.2px] text-muted-foreground font-['Space_Grotesk']">
                      Receive codes via email
                    </p>
                  </div>
                </div>

                <div className="sm:justify-self-end">
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    variant={isEmailMFAEnabled ? "destructive" : "default"}
                    disabled={!isMfaSupported}
                    onClick={() => {
                      if (!isMfaSupported) {
                        toast({
                          title: "Not available",
                          description:
                            "Email MFA is not supported for Google/Apple sign-in accounts.",
                          variant: "destructive",
                        });
                        return;
                      }
                      handleToggleEmailMFA();
                    }}
                    type="button"
                    data-testid={
                      isEmailMFAEnabled
                        ? "security-disable-button"
                        : "dashboard-setup-email-otp-button"
                    }
                  >
                    <span data-testid="dashboard-setup-email-otp-button">
                      {isEmailMFAEnabled ? "Disable" : "Setup"}
                    </span>
                  </Button>
                </div>
              </div>
            </DashboardCard>
          </div>

          </div>
        </DashboardCard>

        {/* Connected Devices */}
        <DashboardCard className="rounded-[10px] border border-brand-blue-10 bg-brand-blue-07 p-6 dark:bg-public-card-bg-dark dark:border-border-white-08 font-['Space_Grotesk']">
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
                    <p className="flex items-center gap-2 text-sm font-medium font-['Space_Grotesk']">
                      {session.deviceName || "Unknown Device"}
                      {session.isCurrentSession && (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 font-['Space_Grotesk']">
                          THIS DEVICE
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-muted-foreground font-['Space_Grotesk']">
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
