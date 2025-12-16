
// src/app/auth/_components/forgot-password-dialog.tsx

"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { checkMfaStatus, sendRecoveryEmail } from "@/api/mfa-recovery";

import { cn } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useTheme } from "next-themes";

import { useToast } from "@/hooks/use-toast";

import { handleResetPassword } from "@/lib/services/auth";

import { ResetPasswordDialog } from "./reset-password-dialog";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordDialog({
  isOpen,
  onClose,
}: ForgotPasswordDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // step: "email" (forgot form) → "reset" (set new password)
  const [step, setStep] = useState<"email" | "reset">("email");
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  if (!isOpen) return null;

  const logoSrc = isDark
    ? "/assets/authlayout/dark/sensepc-logo-code-dark.svg"
    : "/assets/authlayout/light/sensepc-logo-code.svg";

  const handleSuccessStartReset = (email: string) => {
    // ✅ instead of router.push(...), show reset dialog inline
    setResetEmail(email);
    setStep("reset");
  };

  const handleCloseAll = () => {
    // reset local state and close overlay
    setStep("email");
    setResetEmail(null);
    onClose();
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const email = data.email.trim().toLowerCase();
    Logger.log("Submitted email:", email);

    try {
      Logger.log("Calling checkMfaStatus...");
      const mfaResult = await checkMfaStatus(email);
      Logger.log("MFA Status Response:", mfaResult);

      const action = mfaResult?.action;

      if (action === "custom_recovery") {
        Logger.log("Email MFA enabled. Triggering secure recovery email...");
        await sendRecoveryEmail(email);
        toast({
          title: "Recovery Email Sent",
          description:
            "We've sent a secure recovery link to your email. Please check your inbox.",
        });
      } else if (action === "external_provider") {
        toast({
          title: `${mfaResult.provider} Sign-in Detected`,
          description: mfaResult.message,
        });
      } else if (action === "cognito_reset") {
        Logger.log("Email MFA not enabled. Proceeding with Cognito reset...");
        const response = await handleResetPassword(email);
        Logger.log("📨 Cognito Reset Response:", response);

        if (response.success) {
          // ✅ now we move to reset-password step inside same overlay
          handleSuccessStartReset(email);
        } else {
          Logger.error("Cognito Reset Failed:", response.error);
          toast({
            title: "Reset Failed",
            description: response.error || "Unable to initiate reset.",
            variant: "destructive",
          });
        }
      } else {
        Logger.warn(
          "Unexpected response from MFA API. Fallback to Cognito reset..."
        );
        const response = await handleResetPassword(email);
        if (response.success) {
          handleSuccessStartReset(email);
        } else {
          toast({
            title: "Reset Failed",
            description: response.error || "Unable to initiate reset.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.";
      Logger.error("Error in forgot password flow:", msg);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center bg-black/50 backdrop-blur-[2px] px-4">
      {step === "reset" ? (
        <ResetPasswordDialog
          isOpen
          email={resetEmail}
          onClose={handleCloseAll}
          variant="card" // 👈 card-only, no extra overlay
        />
      ) : (
        <div
          className={cn(
            "w-full max-w-[480px] rounded-[16px] p-8 shadow-xl flex flex-col items-center",
            isDark ? "bg-[#140947]" : "bg-white"
          )}
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
                priority
              />
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-1 items-center text-center">
              <h1
                className={cn(
                  "text-2xl font-semibold tracking-[-0.04em]",
                  isDark ? "text-white" : "text-[#020816]"
                )}
              >
                Forgot Password
              </h1>
              <p
                className={cn(
                  "text-sm max-w-sm",
                  isDark ? "text-[#B9C2D5]" : "text-[#454545]"
                )}
              >
                Enter your email address and we&apos;ll send you instructions to
                reset your password.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-4 mt-1"
            >
              <div className="space-y-2">
                <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]"
              >
                Email
              </label>
               <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                variant="auth"
                intent={errors.email ? "error" : "default"}
                {...register("email")}
              />


                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="
                  w-full
                  rounded-full
                  text-sm font-medium
                "
              >
                {isSubmitting ? "Sending..." : "Confirm reset request"}
              </Button>
            </form>

            {/* Back to sign in */}
            <button
              type="button"
              onClick={() => {
                handleCloseAll();
                router.push(routes.signIn);
              }}
              className={cn(
                "mt-1 text-sm hover:underline",
                isDark ? "text-[#B9C2D5]" : "text-[#454545]"
              )}
            >
              Remember your password?{" "}
              <span className="font-medium text-link-primary">Back to Sign in</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
