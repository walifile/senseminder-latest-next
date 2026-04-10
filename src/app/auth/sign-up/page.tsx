"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useSubscribeToNewsletterMutation } from "@/api/newsletterAPI";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicCard } from "@/components/ui/public-card";

import {
  Eye,
  Mail,
  Lock,
  User,
  EyeOff,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import useLocation from "@/hooks/use-location";

import { handleSignUp } from "@/lib/services/auth";

import SocailLogin from "../_components/socail-login";
import { OtpVerificationDialog } from "../_components/otp-verification-dialog";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { userLocation } = useLocation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [subscribeToNewsletter] = useSubscribeToNewsletterMutation();

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  const passwordChecks = useMemo(
    () => [
      {
        label: "At least 8 characters",
        valid: password.length >= 8,
      },
      {
        label: "One uppercase letter",
        valid: /[A-Z]/.test(password),
      },
      {
        label: "One lowercase letter",
        valid: /[a-z]/.test(password),
      },
      {
        label: "One number",
        valid: /\d/.test(password),
      },
      {
        label: "One special character",
        valid: /[^A-Za-z0-9]/.test(password),
      },
      {
        label: "Passwords match",
        valid: confirmPassword.length > 0 && password === confirmPassword,
      },
    ],
    [password, confirmPassword],
  );

  const isPasswordValid = passwordChecks.slice(0, 5).every((item) => item.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast({
        title: "Weak password",
        description:
          "Please make sure your password meets all required conditions.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Password and Confirm Password do not match.",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Accept Terms",
        description:
          "Please accept the Terms of Service and Privacy Policy to continue.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const signupPayload = {
        email,
        password,
        firstName,
        lastName,
        acceptedLegal: acceptTerms,
      };

      const location = userLocation || {
        country: "unknown",
        city: "unknown",
        ip: "unknown",
      };

      const response = await handleSignUp(signupPayload);

      if (response.success) {
        await subscribeToNewsletter({
          email,
          location,
          signup: true,
        });

        toast({
          title: "Success",
          description: (
            <span data-testid="signup-success-message">
              Account created successfully! Please verify your email.
            </span>
          ),
        });

        sessionStorage.setItem("verificationEmail", email);

        setOtpEmail(email);
        setIsOtpOpen(true);
      } else {
        toast({
          title: "Error",
          description: response.error || "Something went wrong!",
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      toast({
        title: "Unexpected Error",
        description: error.message || "Something went wrong!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full px-4 pb-10 pt-24 md:px-6 md:pb-14 md:pt-20 lg:pt-[150px]">
        <div className="mx-auto w-full max-w-[1280px]">
          <PublicCard
            className={cn(
              "relative mx-auto w-full max-w-[940px] overflow-hidden rounded-[28px]",
            )}
          >
            <div className="relative z-10 grid gap-6 px-5 py-6 md:px-7 md:py-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.78fr)] lg:items-center lg:gap-8 lg:px-8 lg:py-8">
              <div className="flex items-start justify-center lg:justify-start">
                <div className="w-full max-w-[430px] space-y-4">
                  <div className="space-y-3">
                    <h2 className="font-space-grotesk text-[24px] font-bold leading-[1.15] text-slate-900 dark:text-white md:text-[25px]">
                      Create your personal account
                    </h2>
                    <p className="max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-300 md:text-[15px]">
                      Sign up to start building your cloud PC in
                      minutes.
                    </p>
                  </div>

                  <div className="relative w-full max-w-[400px]">
                    <Image
                      src="/assets/authlayout/light/signup-illustration.svg"
                      alt="Sense PC signup illustration"
                      width={640}
                      height={520}
                      priority
                      className="h-auto w-full object-contain dark:hidden"
                    />

                    <Image
                      src="/assets/authlayout/light/signup-illustration-dark.svg"
                      alt="Sense PC signup illustration"
                      width={640}
                      height={520}
                      priority
                      className="hidden h-auto w-full object-contain dark:block dark:opacity-80"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative mx-auto w-full max-w-[380px]">
                  <div className="relative z-10">
                    <div className="mb-5 text-center">
                      <div className="inline-flex items-center rounded-full bg-[#2530F0]/10 px-3 py-1.5 text-xs font-medium text-[#2530F0] dark:bg-white/10 dark:text-[#B9C2D5]">
                        Sign up
                      </div>

                      <h1 className="mt-3 text-[20px] font-semibold tracking-tight text-slate-900 dark:text-white md:text-[22px]">
                        Create your account
                      </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            data-testid="signup-first-name-input"
                            uiSize="lg"
                            className="h-9 pl-10 text-sm"
                          />
                        </div>

                        <div className="relative">
                          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            data-testid="signup-last-name-input"
                            uiSize="lg"
                            className="h-9 pl-10 text-sm"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          data-testid="signup-email-input"
                          uiSize="lg"
                          className="h-9 pl-10 text-sm"
                        />
                      </div>

                      <div className="pt-1">
                        <div className="mb-2 flex items-center gap-3">
                          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                            Account security
                          </p>
                          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            data-testid="signup-password-input"
                            uiSize="lg"
                            className="h-9 pl-10 pr-10 text-sm"
                          />

                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            data-testid="signup-confirm-password-input"
                            uiSize="lg"
                            className="h-9 pl-10 pr-10 text-sm"
                          />

                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {password.length > 0 && (
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5">
                            <p className="mb-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              Password must include:
                            </p>

                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                              {passwordChecks.map((item) => (
                                <div
                                  key={item.label}
                                  className={cn(
                                    "flex items-center gap-1.5 text-[11px] leading-4 transition-colors",
                                    item.valid
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-slate-400 dark:text-slate-500",
                                  )}
                                >
                                  <CheckCircle2
                                    className={cn(
                                      "h-3.5 w-3.5 shrink-0",
                                      item.valid
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-slate-300 dark:text-slate-600",
                                    )}
                                  />
                                  <span>{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-1">
                        <label className="flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-300">
                          <Checkbox
                            id="terms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) =>
                              setAcceptTerms(checked === true)
                            }
                            data-testid="signup-accept-terms-checkbox"
                          />

                          <span>
                            I accept the{" "}
                            <Link
                              href="/terms"
                              className="font-medium text-link-primary underline"
                            >
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/privacy"
                              className="font-medium text-link-primary underline"
                            >
                              Privacy Policy
                            </Link>
                          </span>
                        </label>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        size="lg"
                        data-testid="signup-submit-button"
                        className={cn(
                          "mt-3 h-9 w-full rounded-full text-sm font-medium",
                          "bg-gradient-to-l from-[#a801ba] to-[#2530f0]",
                          "hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
                        )}
                      >
                        {isLoading ? (
                          "Signing up..."
                        ) : (
                          <span className="inline-flex items-center justify-center gap-2">
                            <span>Sign Up</span>
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center text-sm">
                        <span className="h-px flex-1 bg-slate-200/70 dark:bg-white/10" />
                        <span className="mx-3 text-slate-400 dark:text-slate-300">
                          Or continue with
                        </span>
                        <span className="h-px flex-1 bg-slate-200/70 dark:bg-white/10" />
                      </div>

                      <SocailLogin />

                      <p className="text-center text-sm text-slate-400 dark:text-slate-300">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="font-semibold text-link-primary hover:underline"
                          onClick={() => router.push("/auth")}
                        >
                          Log in
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PublicCard>
        </div>
      </div>

      <OtpVerificationDialog
        isOpen={isOtpOpen}
        email={otpEmail}
        onClose={() => setIsOtpOpen(false)}
        otpInputTestId="signup-otp-input"
        submitButtonTestId="signup-verify-otp-button"
        onVerified={() => {
          setIsOtpOpen(false);
          router.push("/auth");
        }}
      />
    </>
  );
}