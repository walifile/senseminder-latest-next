"use client";

import { z } from "zod";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  handleResetPassword,
  handleConfirmResetPassword,
} from "@/lib/services/auth";
import OTPDialog from "../_components/otp-dialog";
import { routes } from "@/constants/routes";

const schema = z
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

type FormValuesType = z.infer<typeof schema>;

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [verificationOtp, setVerificationOtp] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValuesType>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (email && !otpVerified) {
      sendOTP();
    }
  }, [email]);

  const sendOTP = async () => {
    try {
      setIsLoading(true);
      const response = await handleResetPassword(email!);

      if (response.success) {
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your email.",
        });
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

  const handleOTPSubmit = async (otp: string) => {
    try {
      setIsLoading(true);
      setVerificationOtp(otp);
      setOtpVerified(true);
      setIsDialogOpen(false);
      
      toast({
        title: "Verification Successful",
        description: "Now you can set your new password.",
      });
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

  const onSubmit = async (data: FormValuesType) => {
    try {
      setIsLoading(true);
      const response = await handleConfirmResetPassword(
        email!,
        verificationOtp,
        data.password
      );

      if (response.success) {
        toast({
          title: "Password Reset Successful",
          description: "You can now sign in with your new password.",
        });
        router.push(routes?.signIn);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to reset password",
          variant: "destructive",
        });
        // If OTP expired, reopen the OTP dialog
        setOtpVerified(false);
        setIsDialogOpen(true);
        sendOTP();
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

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      const response = await handleResetPassword(email!);

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
          : "Unable to send OTP. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {otpVerified ? "Set New Password" : "Verify Your Email"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {email
            ? otpVerified
              ? `Resetting password for ${email}`
              : `Please verify your email ${email} to continue`
            : "Enter your new password below"}
        </p>
      </div>

      {otpVerified ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              New Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              {...register("password")}
              className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
            />
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              {...register("confirmPassword")}
              className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60"
          >
            {isLoading ? "Submitting..." : "Reset Password"}
          </Button>
        </form>
      ) : (
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60"
        >
          Enter Verification Code
        </Button>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Know your password?{" "}
        <Link
          href="/auth"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Sign in
        </Link>
      </p>

      <OTPDialog
        isOpen={isDialogOpen}
        onClose={() => {
          if (otpVerified) {
            setIsDialogOpen(false);
          }
        }}
        onSubmit={handleOTPSubmit}
        onResend={handleResendOTP}
        isLoading={isLoading}
        isResending={isResending}
      />
    </div>
  );
}
