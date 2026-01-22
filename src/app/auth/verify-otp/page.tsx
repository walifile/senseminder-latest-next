
"use client";

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
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { handleResendOtp, handleConfirmSignUp } from "@/lib/services/auth";

const formSchema = z.object({
  pin: z
    .string()
    .min(6, "Your one-time password must be 6 digits.")
    .max(6, "Your one-time password must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VerifyOtp() {
  const router = useRouter();
  const { toast } = useToast();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsVerifying(true);
      const email = sessionStorage.getItem("verificationEmail");

      if (!email) {
        toast({
          title: "Verification Failed",
          description: "Email not found. Please sign up again.",
        });
        router.push("/auth/sign-up");
        return;
      }

      const response = await handleConfirmSignUp(email, data.pin);

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
        router.push("/auth");
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
      const email = sessionStorage.getItem("verificationEmail");

      if (!email) {
        toast({
          title: "Resend Failed",
          description: "Email not found. Please sign up again.",
        });
        router.push("/auth/sign-up");
        return;
      }

      const response = await handleResendOtp(email);

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

  return (
    <div className="relative min-h-screen w-full">
      {/* Dark overlay over the auth background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />

      {/* Centered dialog */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
              Verify Your Email
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;ve sent a 6-digit code to your email. Enter it below.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-center text-sm font-medium text-slate-700">
                      One-Time Password
                    </FormLabel>
                    <FormControl>
                      <div className="flex justify-center mt-2">
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            {[...Array(6)].map((_, i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormDescription className="text-center text-xs text-slate-500">
                      Please enter the 6-digit code we sent to your email.
                    </FormDescription>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              {/* Main action button – using existing Button component */}
              <Button
                type="submit"
                disabled={isVerifying || isResending}
                size="lg"
                className="w-full rounded-full text-sm font-medium"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>
          </Form>

          {/* Resend + Back links */}
          <div className="mt-4 space-y-3 text-center">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-xs text-[#5f4bf6] hover:underline disabled:opacity-60"
            >
              {isResending ? (
                <>
                  <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />
                  Resending...
                </>
              ) : (
                "Didn't receive the code? Click to resend"
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="block w-full text-xs text-slate-500 hover:underline"
            >
              Back to Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
