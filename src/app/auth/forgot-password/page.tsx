

"use client";

import { z } from "zod";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";

import { handleResetPassword } from "@/lib/services/auth";
import { checkMfaStatus, sendRecoveryEmail } from "@/api/mfa-recovery"; 

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const email = data.email.trim().toLowerCase();
    console.log("Submitted email:", email);

    try {
      console.log("Calling checkMfaStatus...");
      const mfaResult = await checkMfaStatus(email);
      console.log("MFA Status Response:", mfaResult);

      const action = mfaResult?.action;

      if (action === "custom_recovery") {
        console.log("Email MFA enabled. Triggering secure recovery email...");
        await sendRecoveryEmail(email);
        toast({
          title: "Recovery Email Sent",
          description:
            "We've sent a secure recovery link to your email. Please check your inbox.",
        });
      } else if (action === "cognito_reset") {
        console.log("Email MFA not enabled. Proceeding with Cognito reset...");
        const response = await handleResetPassword(email);
        console.log("📨 Cognito Reset Response:", response);

        if (response.success) {
          router.push(
            `${routes?.resetPassword}?email=${encodeURIComponent(email)}`
          );
        } else {
          console.error("Cognito Reset Failed:", response.error);
          toast({
            title: "Reset Failed",
            description: response.error || "Unable to initiate reset.",
            variant: "destructive",
          });
        }
      } else {
        console.warn("Unexpected response from MFA API. Fallback to Cognito reset...");
        const response = await handleResetPassword(email);
        if (response.success) {
          router.push(
            `${routes?.resetPassword}?email=${encodeURIComponent(email)}`
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
        error instanceof Error ? error.message : "Something went wrong. Try again.";
      console.error("Error in forgot password flow:", msg);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Forgot Password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your email address and we’ll send you instructions to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
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
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Confirm reset request"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Remember your password?{" "}
        <Link
          href="/auth"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Sign in
        </Link>
      </p>
    </div>
  );
}
