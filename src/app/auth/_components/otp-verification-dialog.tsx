
// src/app/auth/_components/otp-verification-dialog.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

import { useToast } from "@/hooks/use-toast";

import { handleResendOtp, handleConfirmSignUp } from "@/lib/services/auth";

const formSchema = z.object({
  pin: z
    .string()
    .min(6, "Your one-time password must be 6 digits.")
    .max(6, "Your one-time password must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

interface OtpVerificationDialogProps {
  isOpen: boolean;
  email: string | null;
  onClose: () => void;
  onVerified?: () => void; // e.g. redirect to /auth
  otpInputTestId?: string;
  submitButtonTestId?: string;
}

export function OtpVerificationDialog({
  isOpen,
  email,
  onClose,
  onVerified,
  otpInputTestId,
  submitButtonTestId,
}: OtpVerificationDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: FormValues) => {
    try {
      setIsVerifying(true);

      const targetEmail =
        email || sessionStorage.getItem("verificationEmail");

      if (!targetEmail) {
        toast({
          title: "Verification Failed",
          description: "Email not found. Please sign up again.",
        });
        onClose();
        router.push("/auth/sign-up");
        return;
      }

      const response = await handleConfirmSignUp(targetEmail, data.pin);

      if (response.success) {
        toast({
          title: "Success",
          description: (
            <span data-testid="signup-verify-otp-success-message">
              Your email has been verified successfully. You can now sign in.
            </span>
          ),
        });

        sessionStorage.removeItem("verificationEmail");

        if (onVerified) {
          onVerified();
        } else {
          router.push("/auth");
        }
      } else {
        toast({
          title: "Invalid OTP",
          description:
            response.error ||
            "The code you entered is incorrect. Please try again.",
        });
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown verification error");

      toast({
        title: "Verification Error",
        description:
          error.message || "Something went wrong during verification.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);

      const targetEmail =
        email || sessionStorage.getItem("verificationEmail");

      if (!targetEmail) {
        toast({
          title: "Resend Failed",
          description: "Email not found. Please sign up again.",
        });
        onClose();
        router.push("/auth/sign-up");
        return;
      }

      const response = await handleResendOtp(targetEmail);

      if (response.success) {
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        toast({
          title: "Resend Failed",
          description:
            response.error || "Failed to resend the verification code.",
        });
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown resend error");

      toast({
        title: "Error",
        description:
          error.message || "An error occurred while resending the code.",
      });
    } finally {
      setIsResending(false);
    }
  };
  const logoSrc = isDark
  ? "/assets/authlayout/dark/sensepc-logo-dark.png"
  : "/assets/authlayout/light/sensepc-logo-code.png"

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
              Verify Your Email
            </h1>
            <p
              className={`
                text-sm
                ${isDark ? "text-[#A3A3A3]" : "text-[#454545]"}
              `}
            >
              We&apos;ve sent a 6-digit code to your email.
            </p>
          </div>

          {/* Form + OTP + Continue button */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex flex-col items-center gap-4"
            >
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col items-center">
                    <FormControl>
                      <div className="flex justify-center w-full">
                        <InputOTP
                          maxLength={6}
                          data-testid={otpInputTestId}
                          {...field}
                        >
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
                disabled={isVerifying || isResending}
                size="lg"
                data-testid={submitButtonTestId}
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
          </Form>

          {/* Back to sign in */}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/auth");
            }}
            className={`
              text-sm mt-1
              hover:underline
              ${isDark ? "text-[#B9C2D5]" : "text-[#454545]"}
            `}
          >
            Back to Sign in
          </button>

          {/* Bottom legal + resend */}
          <div className="flex flex-col items-center gap-2 mt-1">
            <div className="flex items-center justify-center gap-3 text-xs">
              <Link
                href="/terms"
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
                href="/privacy"
                className={`
                  whitespace-nowrap hover:underline
                  ${isDark ? "text-[#B9C2D5]" : "text-[#454545]"}
                `}
              >
                Privacy Policy
              </Link>
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className={`
                text-xs underline-offset-2
                hover:underline
                ${isDark ? "text-[#B9C2D5]" : "text-[#454545]"}
              `}
            >
              {isResending ? "Resending..." : "Resend code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
