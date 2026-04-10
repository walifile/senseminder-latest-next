/* eslint perfectionist/sort-imports: "off" */

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";

import { routes } from "@/constants/routes";
import { useCompleteFirstLoginMutation } from "@/api/first-time-setup";
import { fetchAuthSession } from "aws-amplify/auth";
import { handleSignOut } from "@/lib/services/auth";
import { useEmailFromSession } from "@/hooks/useEmailFromSession";

import { Form } from "@/components/shared/hook-form/form-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { checkOnboarded } from "@/lib/utils/checkOnboarded";
import { useSubUserInfo } from "@/hooks/use-sub-userInfo";
import { Logger } from "@/lib/utils/logger";
import { Info } from "lucide-react";

type WelcomeFormValues = {
  fullName: string;
  acceptTerms: boolean;
};

export default function WelcomePage() {
  // Theme (for logo + card color)
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const logoSrc = isDark
    ? "/assets/authlayout/dark/sensepc-logo-dark.png"
    : "/assets/authlayout/light/sensepc-logo-code.png";

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
  const {
    email,
    loading: emailLoading,
    error: emailError,
  } = useEmailFromSession();

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

  const { handleSubmit, watch, formState, setValue, register } = methods;
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#f5f6ff] dark:bg-[#0A0A1B]">
      <div className="w-full max-w-[480px]">
        <div
          className={`
            relative overflow-hidden rounded-[24px] px-8 py-10 shadow-xl border
            ${
              isDark
                ? "bg-[#140947] border-[#4F3FF8]/40"
                : "bg-white border-[#2530F0]/15"
            }
          `}
        >
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src={logoSrc}
              alt="SensePC Logo"
              width={243}
              height={60}
              priority
              className="h-[60px] w-auto"
            />
          </div>

          {/* Heading */}
          <h1
            className={`mb-3 text-center text-2xl font-semibold ${
              isDark ? "text-white" : "text-[#020816]"
            }`}
          >
            {isSubUser ? "Setup your account" : "Create your account"}
          </h1>

          {/* Info banner / notice */}
          {!isSubUser ? (
            <div
              className={`mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-xs ${
                isDark
                  ? "border border-[#3A3A8F] bg-[#2A2067] text-[#E1E3FF]"
                  : "bg-[#EEF0FF] text-[#4B4B7D]"
              }`}
            >
              <span
                className={`mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full ${
                  isDark ? "bg-[#4B3AA8]" : "bg-white/70"
                }`}
              >
                <Info
                  className={`h-3.5 w-3.5 ${
                    isDark ? "text-[#F5F5FF]" : "text-[#6E73B2]"
                  }`}
                />
              </span>
              <p className="leading-relaxed">
                We were unable to find an existing account. A new account will
                be created with the email address below.
              </p>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <p
                className={`text-sm ${
                  isDark ? "text-[#D3D5FF]" : "text-slate-600"
                }`}
              >
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

          {/* Email Display (non-editable) */}
          <div className="mb-4">
            <label
              className={`mb-1 block text-sm font-medium ${
                isDark ? "text-[#D3D5FF]" : "text-slate-700"
              }`}
            >
              Email
            </label>
            <div
              className={`w-full overflow-hidden rounded-xl border px-4 py-3 text-sm break-all leading-relaxed ${
                isDark
                  ? "border-transparent bg-[#2A2067] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
              title={
                emailLoading
                  ? "Loading email..."
                  : emailError
                    ? "Failed to load email"
                    : email || "No email found"
              }
            >
              {emailLoading
                ? "Loading email..."
                : emailError
                  ? "Failed to load email"
                  : email || "No email found"}
            </div>
          </div>

          {/* Form */}
          <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name input (shared Input component) */}
            <div className="mb-4">
              <label
                htmlFor="fullName"
                className={`mb-1 block text-sm font-medium ${
                  isDark ? "text-[#D3D5FF]" : "text-slate-700"
                }`}
              >
                Full Name
              </label>
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Enter your full name"
                variant="glowing"
                wrapperClassName="bg-white dark:bg-[#2A2067]"
                {...register("fullName", { required: true })}
                data-testid="login-full-name-input"
              />
            </div>

            {/* Terms checkbox */}
            <div className="mb-4 flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) =>
                  setValue("acceptTerms", checked === true, {
                    shouldValidate: true,
                  })
                }
                data-testid="login-accept-terms-checkbox"
              />

              <label
                htmlFor="terms"
                className={`text-sm leading-relaxed ${
                  isDark ? "text-[#D3D5FF]" : "text-slate-600"
                }`}
              >
                I have read and accept{" "}
                <a
                  href="/terms"
                  className="font-medium text-[#7C63FF] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="font-medium text-[#7C63FF] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {error && (
              <div className="mb-4 text-center text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Primary button */}
            <Button
              type="submit"
              size="lg"
              disabled={
                !acceptTerms || !fullName.trim() || !isValid || isCompleting
              }
              className="mt-2 w-full rounded-full text-sm font-medium bg-gradient-to-l from-[#A801BA] to-[#2530F0] border-0 hover:opacity-90"
            >
              {isCompleting ? "Creating account..." : "Continue"}
            </Button>
          </Form>

          {/* Footer */}
          <div
            className={`mt-5 text-center text-sm ${
              isDark ? "text-[#B9C2D5]" : "text-slate-500"
            }`}
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={handleGoToLogin}
              className="font-semibold text-[#7C63FF] hover:underline"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
