
// src/app/auth/_components/mfa-email-dialog.tsx

"use client";

/* eslint perfectionist/sort-imports: "off" */

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
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
import { setLoading, setTempUser } from "@/redux/slices/auth/auth-slice";
import { handleSignOut, handlePostAuthentication } from "@/lib/services/auth";
import { confirmSignIn } from "aws-amplify/auth";

interface MfaEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export function MfaEmailDialog({
  isOpen,
  onClose,
  onVerified,
}: MfaEmailDialogProps) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Guard + reset when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    setCode("");
    setIsVerifying(false);

    const stored = sessionStorage.getItem("tempUserMFA");
    if (!stored) {
      toast({
        title: "Session expired",
        description: "Please login again.",
        variant: "destructive",
      });
      onClose();
      router.push(routes.auth);
      return;
    }

    try {
      JSON.parse(stored); // just to validate shape
    } catch {
      toast({
        title: "Invalid session",
        description: "Could not resume your session. Please login again.",
        variant: "destructive",
      });
      onClose();
      router.push(routes.auth);
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
        description: "Please enter the 6-digit code sent to your email.",
        variant: "destructive",
      });
      return;
    }

    const stored = sessionStorage.getItem("tempUserMFA");
    if (!stored) {
      toast({
        title: "Session expired",
        description: "Please login again.",
        variant: "destructive",
      });
      onClose();
      router.push(routes.auth);
      return;
    }

    setIsVerifying(true);
    dispatch(setLoading(true));

    try {
      const result = await confirmSignIn({
        challengeResponse: code,
      });

      if (result.isSignedIn) {
        const finalResult = await handlePostAuthentication();

        if (finalResult.success) {
          // cleanup MFA temp state
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
      } else {
        toast({
          title: "Incorrect code",
          description: "Please check your email and try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Verification failed",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
      await handleSignOut();
      onClose();
      router.push(routes.auth);
    } finally {
      setIsVerifying(false);
      dispatch(setLoading(false));
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
              MFA Email Verification
            </h1>
            <p
              className={`
                text-sm
                ${isDark ? "text-[#A3A3A3]" : "text-[#454545]"}
              `}
            >
              Enter the 6-digit code sent to your email.
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
                disabled={isVerifying}
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
              disabled={isVerifying}
              size="lg"
              className="
                w-full
                rounded-full
                bg-gradient-to-l from-[#A801BA] to-[#2530F0]
                hover:opacity-90
                text-sm font-medium
                border-0
              "
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

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
                  ${isDark ? "bg-[#B9C2D5]" : "text-[#454545]"}
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
      </div>
    </div>
  );
}
