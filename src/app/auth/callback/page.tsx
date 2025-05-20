/* eslint-disable @typescript-eslint/no-unused-vars */
// app/auth/callback/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleAuthRedirect } from "@/lib/services/auth";
import useErrorToast from "@/hooks/useErrorToast";
import useToast from "@/hooks/useToast";
import { Loader2 } from "lucide-react";
import { routes } from "@/constants/routes";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleError } = useErrorToast();
  const { showToast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await handleAuthRedirect();
        if (result.success) {
          router.replace(routes?.home);
        } else {
          if (retryCount < maxRetries) {
            // Wait and retry if failed
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 1000);
          } else {
            handleError("Failed to complete authentication");
            router.replace(routes?.signIn);
          }
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 1000);
        } else {
          handleError("Authentication failed");
          router.replace(routes?.signIn);
        }
      }
    };

    if (searchParams.get("code")) {
      handleCallback();
    }
  }, [router, searchParams, retryCount]);

  return (
    <div className="flex items-center justify-center bg-gray-100 dark:bg-[#0A0A1B] px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-lg text-center space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Completing Sign In
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we verify your credentials...
        </p>
      </div>
    </div>
  );
}
