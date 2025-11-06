"use client";

import Link from "next/link";
import { useState } from "react";
import { routes } from "@/constants/routes";
import { claimSessionIfAvailable } from "@/api/session";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Logger } from "@/lib/utils/logger";

// import SocialSignIn from "./_components/social-signin";
import { useToast } from "@/hooks/use-toast";

import { handleSignIn } from "@/lib/services/auth";

import SocailLogin from "./_components/socail-login";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await handleSignIn(email, password);
      Logger.log("Login Response:", response);
      // Optional: Log nextStep for deeper MFA/debug insight
      if ("nextStep" in response) {
        Logger.log("🟡 Cognito Next Step:", response.nextStep);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        try {
          await claimSessionIfAvailable();
        } catch (error) {
          Logger.error("Error claiming session:", error);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const from = searchParams.get("from");
        const decodedFrom = from
          ? decodeURIComponent(from).replace(/^\//, "")
          : "";
        const redirectTo = decodedFrom ? `/${decodedFrom}` : routes.dashboard;

        router.push(redirectTo);
      } else if (
        "requiresNewPassword" in response &&
        response.requiresNewPassword
      ) {
        toast({
          title: "Temporary Password Detected",
          description: "Please set a new password to continue.",
        });

        router.push(routes.changePassword);
      } else if ("requiresOTP" in response && response.requiresOTP) {
        toast({
          title: "Verification Required",
          description: "Please verify your email before logging in.",
        });

        setTimeout(() => {
          router.push(routes.verifyOTP);
        }, 1500);
      } else if ("mfaRequired" in response && response.mfaRequired) {
        toast({
          title: "MFA Required",
          description:
            "We sent a code to your email. Please enter it to continue.",
        });

        router.push("/auth/mfa-email");
      } else if ("mfaTotp" in response && response.mfaTotp) {
        toast({
          title: "Authenticator Code Required",
          description:
            "Please enter the 6-digit code from your Authenticator App.",
        });

        router.push("/auth/mfa-totp");
      } else if ("chooseMFA" in response && response.chooseMFA) {
        toast({
          title: "Choose MFA Method",
          description: "Select how you want to verify your login.",
        });

        // Store session info
        sessionStorage.setItem(
          "tempUserMFA",
          JSON.stringify(response.signInResult)
        );
        sessionStorage.setItem("mfaEmail", email);
        sessionStorage.setItem(
          "mfaOptions",
          JSON.stringify(response.mfaOptions)
        );

        //  Go to selection page
        router.push("/auth/mfa-select");
      } else {
        toast({
          title: "Login Failed",
          description:
            response.error || "Invalid credentials. Please try again.",
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      toast({
        title: "Error",
        description: error.message || "Something went wrong during login.",
      });

      Logger.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to access your Sense PC
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="email"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="password"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-gray-200 data-[state=checked]:bg-blue-500 dark:border-[#ffffff1a]"
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Remember me
            </label>
          </div>
          <Link
            href={routes.forgotPassword}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-[#ffffff1a]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/80 px-2 text-gray-500 dark:bg-[#0A0A1B]/40 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <SocailLogin />

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{" "}
        <Link
          href={routes.signUp}
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
