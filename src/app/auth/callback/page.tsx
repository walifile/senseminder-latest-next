/* eslint perfectionist/sort-imports: "off" */

"use client";

import { useState, useEffect } from "react";
import { routes } from "@/constants/routes";
import { claimSessionIfAvailable } from "@/api/session";

import { useRouter, useSearchParams } from "next/navigation";
import ErrorIcon from "./ErrorIcon";

import { Loader2 } from "lucide-react";

import useErrorToast from "@/hooks/useErrorToast";

import { handleAuthRedirect } from "@/lib/services/auth";
import { Logger } from "@/lib/utils/logger";


export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleError } = useErrorToast();

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error && errorDescription) {
      const decodedDescription = decodeURIComponent(errorDescription);
      setErrorMessage(decodedDescription);
      return; 
    }

    const code = searchParams.get("code");
    if (!code) return;

    const handleCallback = async () => {
      try {
        const result = await handleAuthRedirect();
        if (result.success) {
          try {
            await claimSessionIfAvailable();
            router.replace(routes.dashboard);
          } catch (err) {
            Logger.warn("Session claim or first login check failed:", err);
            router.replace(routes.dashboard);
          }
        } else {
          if (retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 1000);
          } else {
            handleError("Failed to complete authentication");
            router.replace(routes.signIn);
          }
        }
      } catch {
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 1000);
        } else {
          handleError("Authentication failed");
          router.replace(routes.signIn);
        }
      }
    };

    handleCallback();
  }, [retryCount, router, searchParams, handleError]);

  if (errorMessage) {
return (
  <div className="space-y-6 text-center">
    <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
        <ErrorIcon />
    </div>

    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
      Sign-in Error
    </h2>

    <p className="text-sm text-gray-600 dark:text-gray-400">
      {errorMessage}
    </p>

    <button
      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
      onClick={() => router.push(routes.signIn)}
    >
      Go Back to Sign In
    </button>
  </div>
);

}
return (
  <div className="space-y-5 text-center">
    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />

    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
      Completing Sign In
    </h2>

    <p className="text-sm text-gray-600 dark:text-gray-400">
      Please wait while we verify your credentials…
    </p>
  </div>
);


}
