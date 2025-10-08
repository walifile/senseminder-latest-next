"use client";

import Link from "next/link";
import Image from "next/image";
import { routes } from "@/constants/routes";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { confirmSignIn, updateMFAPreference } from "aws-amplify/auth";

import { useToast } from "@/hooks/use-toast";

export default function MFASelectPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [options, setOptions] = useState<string[]>([]);
  const [remember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("tempUserMFA");
    if (stored) {
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
        router.replace("/auth");
      }
    } else {
      toast({
        title: "Session expired",
        description: "Please log in again.",
        variant: "destructive",
      });
      router.replace("/auth");
    }
  }, []);

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

      // Route based on next step
      const next = result?.nextStep?.signInStep;

      if (next === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
        router.push("/auth/mfa-totp");
      } else if (next === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
        router.push("/auth/mfa-email");
      } else {
        router.push("/dashboard");
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


  return (
  <div className="space-y-6">
    <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 -mx-8 -mt-8 mb-4 rounded-t-2xl" />
    <div className="flex justify-center mb-2">
      <Image
        src="/sensepc-logo.png"
        alt="SensePC Logo"
        width={160}
        height={40}
        priority
        className="h-12 w-auto"
      />
    </div>
    <div className="space-y-2 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">
        Select MFA Method
      </h2>
      <p className="text-sm text-muted-foreground">
        Choose how you want to verify your identity
      </p>
    </div>

    {/* MFA Options */}
    <div className="space-y-3">
      {options.includes("TOTP") && (
        <Button
          onClick={() => handleSelect("TOTP")}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"

        >
          Use Authenticator App
        </Button>
      )}

      {options.includes("EMAIL") && (
        <Button
          onClick={() => handleSelect("EMAIL")}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"

        >
          Use Email Code
        </Button>
      )}
    </div>
    <p className="text-center text-sm text-muted-foreground">
      <a href="/auth" className="text-blue-600 hover:underline">
        Back to Sign in
      </a>
    </p>

     <div className="text-center text-xs text-muted-foreground space-x-2">
      <Link href={routes.terms} className="hover:underline">
        Terms of Use
      </Link>
      <span>|</span>
      <Link href={routes.privacy} className="hover:underline">
        Privacy Policy
      </Link>
    </div>
  </div>
);
}
