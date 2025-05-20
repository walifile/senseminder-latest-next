"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

import { handleConfirmSignUp, handleResendOtp } from "@/lib/services/auth";
import { useToast } from "@/hooks/use-toast";

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
          description:
            "Your email has been verified successfully. You can now sign in.",
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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Verify Your Email
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We've sent a 6-digit code to your email. Enter it below.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-sm mx-auto"
        >
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-center block">
                  One-Time Password
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        {[...Array(6)].map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormDescription className="text-center">
                  Please enter the 6-digit code we sent to your email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isVerifying || isResending}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5]"
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

      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
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
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        <a
          href="/auth"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Sign in
        </a>
      </p>
    </div>
  );
}
