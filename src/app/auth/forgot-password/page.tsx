// src/app/auth/forgot-password/page.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const router = useRouter();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

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
          router.push(
            `${routes.resetPassword}?email=${encodeURIComponent(email)}`
          );
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
          router.push(
            `${routes.resetPassword}?email=${encodeURIComponent(email)}`
          );
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

  const logoSrc = isDark
    ? "/assets/authlayout/dark/sensepc-logo-code-dark.svg"
    : "/assets/authlayout/light/sensepc-logo-code.svg";

  return (
    <div className="w-full px-4 md:px-6 pt-16 pb-16 md:pb-20">
      <div className="mx-auto flex w-full max-w-[1369px] min-h-[600px] items-center justify-center">
        {/* Card styled like the dialog, but as a normal page card */}
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
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-[#E5E7EB]" : "text-slate-700"
                  )}
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={cn(
                    "h-[56px] rounded-[10px]",
                    errors.email && "border-red-500"
                  )}
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
                  bg-gradient-to-l from-[#A801BA] to-[#2530F0]
                  hover:opacity-90
                  text-sm font-medium
                  border-0
                "
              >
                {isSubmitting ? "Sending..." : "Confirm reset request"}
              </Button>
            </form>

            {/* Back to sign in */}
            <p
              className={cn(
                "mt-2 text-sm text-center",
                isDark ? "text-[#B9C2D5]" : "text-[#454545]"
              )}
            >
              Remember your password?{" "}
              <Link
                href="/auth"
                className={cn(
                  "font-medium hover:underline",
                  isDark ? "text-[#B9C2D5]" : "text-[#454545]"
                )}
              >
                Back to Sign in
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
