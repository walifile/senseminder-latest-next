/* eslint perfectionist/sort-imports: "off" */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { routes } from "@/constants/routes";
import { useClaimSessionIfAvailableMutation } from "@/api/session";
import useErrorToast from "@/hooks/useErrorToast";
import { handleAuthRedirect } from "@/lib/services/auth";
import { Logger } from "@/lib/utils/logger";

import { PublicCard } from "@/components/ui/public-card";
import { Button } from "@/components/ui/button";
import ErrorIcon from "./ErrorIcon";

export default function AuthCallback() {
  const router = useRouter();
  const [claimSessionIfAvailable] = useClaimSessionIfAvailableMutation();
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
            await claimSessionIfAvailable().unwrap();
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
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <PublicCard>
            <div className="flex flex-col items-center gap-8 px-10 py-10 text-center">
              <div>
                <ErrorIcon />
              </div>

              <div className="flex max-w-[520px] flex-col items-center gap-3">
                <h2 className="font-space-grotesk text-2xl font-semibold tracking-[-0.5px] md:text-[32px]">
                  Sign in Error
                </h2>

                <p className="font-inter text-xs leading-relaxed text-paragraph md:text-sm md:leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={() => router.push(routes.signIn)}
              >
                Back to Sign in
              </Button>
            </div>
          </PublicCard>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 px-4 text-center">
      {/* Spinner */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 shadow-sm dark:bg_white/10">
        <Loader2 className="h-6 w-6 animate-spin text-[#5f4bf6]" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        Completing Sign In
      </h2>

      {/* Subtitle */}
      <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">
        Please wait while we verify your credentials. This may take a few
        seconds, do not close this window.
      </p>
    </div>
  );
}
