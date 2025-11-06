/* eslint perfectionist/sort-imports: "off" */

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { routes } from "@/constants/routes";

import { useCompleteFirstLoginMutation } from "@/api/first-time-setup";
import { fetchAuthSession } from "aws-amplify/auth";
import { handleSignOut } from "@/lib/services/auth";
import { useEmailFromSession } from "@/hooks/useEmailFromSession";

import { Form } from "@/components/shared/hook-form/form-provider";
import { RHFText } from "@/components/shared/hook-form/rhf-text";
import { checkOnboarded } from "@/lib/utils/checkOnboarded";
import { useSubUserInfo } from "@/hooks/use-sub-userInfo";
import { Logger } from "@/lib/utils/logger";

type WelcomeFormValues = {
  fullName: string;
  acceptTerms: boolean;
};

export default function WelcomePage() {
  // ---- Redirect if already onboarded ----
  useEffect(() => {
    const check = async () => {
      const onboarded = await checkOnboarded();
      if (onboarded === true) {
        window.location.href = routes.dashboard;
      }
    };
    check();
  }, []);

  // ---- API Hooks ----
  const [completeFirstLogin, { isLoading: isCompleting }] =
    useCompleteFirstLoginMutation();
  const { email, loading: emailLoading, error: emailError } =
    useEmailFromSession();

  // ---- Local state ----
  const [error, setError] = useState("");
  const { isSubUser, organization, role } = useSubUserInfo();
  
  // ---- React Hook Form setup ----
  const methods = useForm<WelcomeFormValues>({
    defaultValues: {
      fullName: "",
      acceptTerms: false,
    },
    mode: "onChange",
  });

  const { handleSubmit, watch, formState } = methods;
  const acceptTerms = watch("acceptTerms");
  const fullName = watch("fullName");
  const isValid = formState.isValid;

  // ---- Submit handler ----
  const onSubmit = async (values: WelcomeFormValues) => {
    setError("");

    if (!values.fullName.trim()) {
      setError("You must provide your full name.");
      return;
    }

    if (!values.acceptTerms) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      await completeFirstLogin({ name: values.fullName }).unwrap();
      await fetchAuthSession({ forceRefresh: true });

      window.location.href = routes.dashboard;
    } catch (err) {
      Logger.error(err);
      setError("Something went wrong while saving your information.");
    }
  };

  const handleGoToLogin = async () => {
    await handleSignOut();
  };

  // ---- UI ----
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 relative overflow-hidden">
          {/* Gradient top bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600" />

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/sensepc-logo.png"
              alt="SensePC Logo"
              width={180}
              height={48}
              priority
              className="h-18 w-auto"
            />
          </div>

          {/* Dynamic heading */}
          <h1 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-6">
            {isSubUser
              ? `Setup your account`
              : "Create your account"}
          </h1>

          {/* Info Banner */}
          {!isSubUser ? (
            <div className="flex items-start space-x-3 mb-8 rounded-lg border border-blue-100 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 px-4 py-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="h-5 w-5 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                We were unable to find an existing account. A new account will be
                created with the email below.
              </p>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {organization ? (
                  <>
                    Complete your setup as{" "}
                    <strong>{role ? role.toLowerCase() : "member"}</strong> of{" "}
                    <strong>{organization}</strong>.
                  </>
                ) : (
                  <>
                    Complete your setup as{" "}
                    <strong>{role ? role.toLowerCase() : "member"}</strong>.
                  </>
                )}
              </p>
            </div>

          )}

          {/* Email Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
              {emailLoading
                ? "Loading email..."
                : emailError
                ? "Failed to load email"
                : email || "No email found"}
            </div>
          </div>

          {/* Form */}
          <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <RHFText
                name="fullName"
                label="Full Name"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="flex items-start space-x-3 mb-6">
              <input
                type="checkbox"
                {...methods.register("acceptTerms")}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                I have read and accept{" "}
                <a
                  href="/terms"
                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {error && (
              <div className="mb-6 text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!acceptTerms || !fullName.trim() || !isValid || isCompleting}
              className={`w-full py-3 rounded-lg font-medium text-white text-sm transition 
              ${
                acceptTerms && fullName.trim() && isValid && !isCompleting
                  ? "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
                  : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              {isCompleting ? "Creating account..." : "Continue"}
            </button>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                onClick={handleGoToLogin}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    
  );
}
