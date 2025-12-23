
// src/app/auth/_components/mfa-totp-dialog.tsx

"use client";

/* eslint perfectionist/sort-imports: "off" */

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from "@/components/ui/input-otp";

import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

import { useDispatch } from "react-redux";

import { useToast } from "@/hooks/use-toast";
import { routes } from "@/constants/routes";
import { sendTotpRecovery } from "@/api/mfa-recovery";
import { setLoading, setTempUser } from "@/redux/slices/auth/auth-slice";
import { getSessionItemSafe } from "@/lib/utils/browser";
import { handleSignOut, handlePostAuthentication } from "@/lib/services/auth";
import { confirmSignIn } from "aws-amplify/auth";

interface MfaTotpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export function MfaTotpDialog({
  isOpen,
  onClose,
  onVerified,
}: MfaTotpDialogProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [recoverySending, setRecoverySending] = useState(false);
  const [loginEmail, setLoginEmail] = useState<string>("");

  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Load MFA email & guard against expired session
  useEffect(() => {
    if (!isOpen) return;

    // reset transient state each time dialog opens
    setCode("");
    setSubmitting(false);
    setRecoveryDialogOpen(false);
    setRecoverySending(false);

    const storedTempUserMFA = sessionStorage.getItem("tempUserMFA");
    if (!storedTempUserMFA) {
      toast({
        title: "Session expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
      onClose();
      router.push(routes.auth);
      return;
    }

    try {
      JSON.parse(storedTempUserMFA); // just validate shape
    } catch {
      toast({
        title: "Invalid session",
        description: "MFA session data is corrupted. Please sign in again.",
        variant: "destructive",
      });
      onClose();
      router.push(routes.auth);
      return;
    }

    const storedEmail = getSessionItemSafe("mfaEmail");
    if (storedEmail) {
      setLoginEmail(storedEmail);
    } else {
      setLoginEmail("");
    }
  }, [isOpen, router, toast, onClose]);

  if (!isOpen) return null;

  const logoSrc = isDark
    ? "/assets/authlayout/dark/sensepc-logo-code-dark.svg"
    : "/assets/authlayout/light/sensepc-logo-code.svg";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast({
        title: "Code required",
        description: "Please enter the 6-digit code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }

    const storedTempUserMFA = sessionStorage.getItem("tempUserMFA");
    if (!storedTempUserMFA) {
      toast({
        title: "Session expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
      onClose();
      router.push(routes.auth);
      return;
    }

    setSubmitting(true);
    dispatch(setLoading(true));

    try {
      const result = await confirmSignIn({ challengeResponse: code });

      if (result.isSignedIn) {
        const finalResult = await handlePostAuthentication();

        if (finalResult.success) {
          // Cleanup temp MFA state
          dispatch(setTempUser(null));
          sessionStorage.removeItem("tempUserMFA");
          sessionStorage.removeItem("mfaOptions");
          sessionStorage.removeItem("mfaEmail");

          toast({
            title: "Logged in",
            description: "MFA verification successful!",
          });

          if (onVerified) {
            onVerified();
          } else {
            router.push(routes.dashboard);
          }

          onClose();
        } else {
          throw new Error("Login finalization failed.");
        }
      } else if (result.nextStep?.signInStep?.startsWith("CONFIRM_SIGN_IN")) {
        toast({
          title: "Incorrect code",
          description: "Please check your authenticator app and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const err = error as Error & { name?: string; message?: string };

      if (
        err?.name === "CodeMismatchException" ||
        err?.message?.toLowerCase?.().includes("invalid code")
      ) {
        toast({
          title: "Incorrect code",
          description: "That code didn’t match. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification failed",
          description:
            err instanceof Error ? err.message : "Something went wrong.",
          variant: "destructive",
        });
        await handleSignOut();
        onClose();
        router.push(routes.auth);
      }
    } finally {
      setSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  const handleTotpRecoveryRequest = async () => {
    if (!loginEmail) {
      toast({
        title: "Cannot send recovery",
        description:
          "We could not detect your login email. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRecoverySending(true);
      await sendTotpRecovery(loginEmail);
      toast({
        title: "Recovery email sent",
        description: `Check your inbox for instructions at ${(
          loginEmail
        )}.`,
      });
      setRecoveryDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to send recovery email.",
        variant: "destructive",
      });
    } finally {
      setRecoverySending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center bg-black/50 backdrop-blur-[2px] px-4">
      <div
        className={`
          w-full max-w-[480px]
          rounded-[16px] p-8 shadow-xl
          flex flex-col items-center
          ${isDark ? "bg-[#140947]" : "bg-white"}
        `}
      >
        <div className="w-full flex flex-col items-center gap-5">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src={logoSrc}
              alt="SensePC Logo"
              width={243}
              height={60}
              className="h-[60px] w-auto"
            />
          </div>

          {/* Title + subtitle */}
          <div className="flex flex-col gap-1 items-center text-center">
            <h1
              className={`
                text-2xl font-semibold tracking-[-0.04em]
                ${isDark ? "text-white" : "text-[#020816]"}
              `}
            >
              MFA Authentication Verification
            </h1>
            <p
              className={`
                text-sm
                ${isDark ? "text-[#A3A3A3]" : "text-[#454545]"}
              `}
            >
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>

          {/* OTP input + Continue button */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col items-center gap-4"
          >
            <div className="w-full flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(val) => setCode(val)}
                disabled={submitting}
                data-testid="login-mfa-input"
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              data-testid="login-mfa-submit-button"
              className="
                w-full
              "
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          {/* Lost access + Request recovery */}
          <div
            className={`
              text-sm mt-1 text-center
              ${isDark ? "text-[#B9C2D5]" : "text-[#454545]"}
            `}
          >
            Lost access to your Authenticator App?{" "}
            <button
              type="button"
              onClick={() => setRecoveryDialogOpen(true)}
              className="underline underline-offset-2 hover:opacity-90 text-link-primary"
            >
              Request recovery
            </button>
          </div>

          {/* Back to sign in */}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(routes.auth);
            }}
            className={`
              text-sm mt-1
              hover:underline
              ${isDark ? "text-[#B9C2D5]" : "text-[#454545]"}
            `}
          >
            Back to Sign in
          </button>

          {/* Terms + Privacy */}
          <div className="flex flex-col items-center gap-2 mt-1">
            <div className="flex items-center justify-center gap-3 text-xs">
              <Link
                href={routes.terms}
                className={`
                  whitespace-nowrap hover:underline
                  ${isDark ? "text-[#B9C2D5]" : "text-[#454545]"}
                `}
              >
                Terms of us
              </Link>

              <span
                className={`
                  h-5 w-px
                  ${isDark ? "bg-[#B9C2D5]" : "bg-[#454545]"}
                  opacity-70
                `}
              />

              <Link
                href={routes.privacy}
                className={`
                  whitespace-nowrap hover:underline
                  ${isDark ? "text-[#B9C2D5]" : "text-[#454545]"}
                `}
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Recovery dialog (inner) */}
        <Dialog open={recoveryDialogOpen} onOpenChange={setRecoveryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recover Authenticator Access</DialogTitle>
              <DialogDescription>
                We&apos;ll send a link to disable your Authenticator App to:
                <br />
                <span className="font-medium">
                  {loginEmail ? loginEmail : "—"}
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <Button
                variant="ghost"
                onClick={() => setRecoveryDialogOpen(false)}
                disabled={recoverySending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTotpRecoveryRequest}
                disabled={recoverySending || !loginEmail}
              >
                {recoverySending ? "Sending..." : "Send Recovery Email"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
