
// src/app/auth/_components/mfa-select-dialog.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";

import { Button } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";

import { confirmSignIn, updateMFAPreference } from "aws-amplify/auth";

import { useTheme } from "next-themes";

import { useToast } from "@/hooks/use-toast";

interface MfaSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;

  // Parent will open the follow-up dialogs
  onRequireTotp: () => void;
  onRequireEmail?: () => void;
}

export function MfaSelectDialog({
  isOpen,
  onClose,
  onRequireTotp,
  onRequireEmail,
}: MfaSelectDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [remember] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const stored = sessionStorage.getItem("tempUserMFA");
    if (!stored) {
      toast({
        title: "Session expired",
        description: "Please log in again.",
        variant: "destructive",
      });
      onClose();
      router.replace("/auth");
      return;
    }

    try {
      const user = JSON.parse(stored);
      const available = user?.nextStep?.allowedMFATypes || [];
      setOptions(available);
    } catch {
      toast({
        title: "Invalid session",
        description: "MFA session data is corrupted.",
        variant: "destructive",
      });
      onClose();
      router.replace("/auth");
    }
  }, [isOpen, router, toast, onClose]);

  const handleSelect = async (method: "TOTP" | "EMAIL") => {
    setLoading(true);
    try {
      const raw = sessionStorage.getItem("tempUserMFA");
      if (!raw) throw new Error("Missing MFA session");

      const result = await confirmSignIn({
        challengeResponse: method,
      });

      if (remember) {
        await updateMFAPreference({
          [method.toLowerCase()]: "PREFERRED",
        });
      }

      const next = result?.nextStep?.signInStep;

      if (next === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
        onClose();
        onRequireTotp();
      } else if (next === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
        onClose();
        if (onRequireEmail) {
          onRequireEmail();
        } else {
          router.push("/auth/mfa-email");
        }
      } else {
        onClose();
        router.push(routes.dashboard);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorMessage(err, "Failed to continue MFA flow."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const logoSrc = isDark
    ? "/assets/authlayout/dark/sensepc-logo-dark.png"
    : "/assets/authlayout/light/sensepc-logo-code.png";

  return (
    <div className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center bg-black/50 backdrop-blur-[2px] px-4">
      <div
        className={cn(
          "w-full max-w-[520px] rounded-[16px] p-8 shadow-xl flex flex-col items-center",
          isDark ? "bg-[#140947]" : "bg-white"
        )}
      >
        <div className="w-full flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src={logoSrc}
              alt="SensePC Logo"
              width={243}
              height={60}
              className="h-[60px] w-auto"
              priority
            />
          </div>

          {/* Heading */}
          <div className="flex flex-col items-center text-center gap-1">
            <h1
              className={cn(
                "text-2xl font-semibold tracking-[-0.04em]",
                isDark ? "text-white" : "text-[#020816]"
              )}
            >
              Select MFA Method
            </h1>
            <p
              className={cn(
                "text-sm max-w-sm",
                isDark ? "text-[#B9C2D5]" : "text-[#454545]"
              )}
            >
              Choose how you want to verify your identity
            </p>
          </div>

          {/* MFA options */}
          <div className="w-full flex flex-col gap-4 mt-1">
            {options.includes("TOTP") && (
              <Button
                type="button"
                disabled={loading}
                onClick={() => handleSelect("TOTP")}
                size="lg"
                className="
                  w-full
                  rounded-full
                  bg-gradient-to-l from-[#A801BA] to-[#2530F0]
                  hover:opacity-90
                  text-sm font-medium
                  border-0
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                Use Authenticator App
              </Button>
            )}

            {options.includes("EMAIL") && (
              <Button
                type="button"
                disabled={loading}
                onClick={() => handleSelect("EMAIL")}
                variant="outline"
                size="lg"
                className={cn(
                  "w-full rounded-full text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed",
                  "border-gray-200 bg-white/50 text-gray-700 hover:bg-gray-50",
                  "dark:border-[#ffffff1a] dark:bg-[#ffffff0f] dark:text-white dark:hover:bg-[#ffffff1a]"
                )}
              >
                Use Email Code
              </Button>
            )}
          </div>

          {/* Back to Sign in */}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/auth");
            }}
            className={cn(
              "mt-1 text-sm hover:underline",
              isDark ? "text-link-primary" : "text-link-primary"
            )}
          >
            Back to Sign in
          </button>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-3 text-xs mt-1">
            <Link
              href={routes.terms}
              className={cn(
                "whitespace-nowrap hover:underline",
                isDark ? "text-[#B9C2D5]" : "text-[#454545]"
              )}
            >
              Terms of us
            </Link>

            <span
              className={cn(
                "h-5 w-px opacity-70",
                isDark ? "bg-[#B9C2D5]" : "bg-[#454545]"
              )}
            />

            <Link
              href={routes.privacy}
              className={cn(
                "whitespace-nowrap hover:underline",
                isDark ? "text-[#B9C2D5]" : "text-[#454545]"
              )}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
