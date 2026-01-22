// src/app/auth/reset-password/page.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { routes } from "@/constants/routes";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from "@/components/ui/input-otp";
import {
  Form,
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useTheme } from "next-themes";

import { useToast } from "@/hooks/use-toast";

import {
  handleResetPassword,
  handleConfirmResetPassword,
} from "@/lib/services/auth";

// 🔹 Password rules – same as old reset-password page
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[a-z]/, "At least one lowercase letter")
      .regex(/[0-9]/, "At least one number")
      .regex(/[^A-Za-z0-9]/, "At least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const otpSchema = z.object({
  code: z
    .string()
    .min(6, "Your code must be 6 digits.")
    .max(6, "Your code must be 6 digits."),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { toast } = useToast();

  const [step, setStep] = useState<"password" | "otp">("password");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const {
    register,
    handleSubmit: handlePasswordFormSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const logoSrc = isDark
    ? "/assets/authlayout/dark/sensepc-logo-code-dark.svg"
    : "/assets/authlayout/light/sensepc-logo-code.svg";

  const isOtpStep = step === "otp";

  // 🔹 STEP 1 – submit new password → send OTP email
  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    if (!email) {
      toast({
        title: "Missing email",
        description: "Email address is required to reset your password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await handleResetPassword(email);

      if (response.success) {
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your email.",
        });
        setNewPassword(data.password);
        setStep("otp");
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to send verification code",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 STEP 2 – submit OTP → confirm password reset
  const handleOtpSubmit = async (values: OtpFormValues) => {
    if (!email) {
      toast({
        title: "Missing email",
        description: "Email address is required to reset your password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await handleConfirmResetPassword(
        email,
        values.code,
        newPassword
      );

      if (response.success) {
        toast({
          title: "Password Reset Successful",
          description: "You can now sign in with your new password.",
        });

        router.push(routes.signIn);
      } else {
        toast({
          title: "Invalid Code",
          description: response.error || "The verification code is incorrect.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify OTP. Please try again.";

      toast({
        title: "Verification Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 resend OTP from OTP step
  const handleResendOTP = async () => {
    if (!email) {
      toast({
        title: "Missing email",
        description: "Email address is required to resend the code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResending(true);
      const response = await handleResetPassword(email);

      if (response.success) {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to send new code",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to resend OTP. Please try again.";

      toast({
        title: "Resend Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 pt-12 md:pt-16 lg:pt-[192px] pb-16 md:pb-20">
      <div className="mx-auto w-full max-w-[1369px] flex justify-center">
        {/* Card – same visual as dialog, but without overlay */}
        <div
          className={cn(
            "w-full max-w-[520px] rounded-[16px] p-8 shadow-xl flex flex-col items-center",
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
                {isOtpStep ? "Verify Your Code" : "Set New Password"}
              </h1>

              {isOtpStep ? (
                <p
                  className={cn(
                    "text-sm max-w-sm",
                    isDark ? "text-[#B9C2D5]" : "text-[#454545]"
                  )}
                >
                  We&apos;ve sent a 6-digit code to your email to confirm your
                  new password.
                </p>
              ) : email ? (
                <p
                  className={cn(
                    "text-sm max-w-sm",
                    isDark ? "text-[#B9C2D5]" : "text-[#454545]"
                  )}
                >
                  Resetting password for {email}
                </p>
              ) : (
                <p
                  className={cn(
                    "text-sm max-w-sm",
                    isDark ? "text-[#B9C2D5]" : "text-[#454545]"
                  )}
                >
                  Enter your new password below.
                </p>
              )}
            </div>

            {/* CONTENT – step based */}
            {isOtpStep ? (
              // 🔹 STEP 2 – OTP input (same style as other OTP dialogs)
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
                  className="w-full flex flex-col items-center gap-4 mt-2"
                >
                  <FormField
                    control={otpForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col items-center">
                        <FormControl>
                          <div className="flex justify-center w-full">
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup>
                                {[...Array(6)].map((_, i) => (
                                  <InputOTPSlot key={i} index={i} />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </FormControl>
                        <FormMessage className="text-center mt-1" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
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
                    {isLoading ? "Verifying..." : "Continue"}
                  </Button>

                  {/* Back + footer */}
                  <button
                    type="button"
                    onClick={() => setStep("password")}
                    className={cn(
                      "text-sm mt-1 hover:underline",
                      isDark ? "text-[#B9C2D5]" : "text-[#454545]"
                    )}
                  >
                    Back to previous step
                  </button>

                  <div className="flex flex-col items-center gap-2 mt-1">
                    <div className="flex items-center justify-center gap-3 text-xs">
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

                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className={cn(
                        "text-xs underline-offset-2 hover:underline",
                        isDark ? "text-[#B9C2D5]" : "text-[#454545]"
                      )}
                    >
                      {isResending ? "Resending..." : "Resend code"}
                    </button>
                  </div>
                </form>
              </Form>
            ) : (
              // 🔹 STEP 1 – password form
              <>
                <form
                  onSubmit={handlePasswordFormSubmit(handlePasswordSubmit)}
                  className="w-full flex flex-col gap-4 mt-1"
                >
                  {/* New password */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className={cn(
                        "text-sm font-medium",
                        isDark ? "text-[#E5E7EB]" : "text-slate-700"
                      )}
                    >
                      New Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      {...register("password")}
                      className={cn(
                        "h-[56px] rounded-[10px]",
                        passwordErrors.password && "border-red-500"
                      )}
                    />
                    {passwordErrors.password && (
                      <p className="text-sm text-red-600 dark:text-red-500">
                        {passwordErrors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className={cn(
                        "text-sm font-medium",
                        isDark ? "text-[#E5E7EB]" : "text-slate-700"
                      )}
                    >
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      {...register("confirmPassword")}
                      className={cn(
                        "h-[56px] rounded-[10px]",
                        passwordErrors.confirmPassword && "border-red-500"
                      )}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-500">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
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
                    {isLoading ? "Submitting..." : "Reset Password"}
                  </Button>
                </form>

                {/* Back to sign in */}
                <p
                  className={cn(
                    "mt-3 text-sm text-center",
                    isDark ? "text-[#B9C2D5]" : "text-[#454545]"
                  )}
                >
                  Know your password?{" "}
                  <Link
                    href={routes.signIn}
                    className="font-medium hover:underline text-[#5f4bf6]"
                  >
                    Back to Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
