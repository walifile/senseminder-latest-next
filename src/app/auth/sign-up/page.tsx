
// src/app/auth/signup/page.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscribeToNewsletterMutation } from "@/api/newsletterAPI";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicCard } from "@/components/ui/public-card";

import { Eye, Mail, Lock, User, EyeOff, ArrowUpRight } from "lucide-react";

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

  // OTP dialog state
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      <div className="w-full px-4 md:px-6 pt-24 md:pt-14 lg:pt-[140px] pb-16 md:pb-20">
        <div className="mx-auto w-full max-w-[1369px]">
          {/* ✅ Outer card now uses PublicCard for bg + border + glass (same as login) */}
          <PublicCard
            className={cn(
              "relative mx-auto w-full max-w-[1320px]",
              "min-h-[640px] lg:min-h-[680px] xl:min-h-[710px]",
            )}
          >
            {/* Inner layout: illustration | form */}
            <div className="relative z-10 grid gap-8 lg:gap-16 pl-6 pr-8 py-6 md:pl-8 md:pr-10 md:py-8 lg:grid-cols-[1fr_0.9fr]">
              {/* LEFT: signup illustration */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-[622px]">
                  {/* Light theme illustration */}
                  <Image
                    src="/assets/authlayout/light/signup-illustration.svg"
                    alt="Sense PC signup illustration"
                    width={640}
                    height={520}
                    priority
                    className="h-auto w-full object-contain dark:hidden"
                  />

                  {/* Dark theme illustration */}
                  <Image
                    src="/assets/authlayout/light/signup-illustration-dark.svg"
                    alt="Sense PC signup illustration"
                    width={640}
                    height={520}
                    priority
                    className="h-auto w-full object-contain hidden dark:block dark:opacity-80"
                  />
                </div>
              </div>

              {/* RIGHT: signup form */}
              <div className="flex items-center">
                <div className="relative mx-auto w-full max-w-[520px]">
                  {/* Ellipse 11 glow behind the form area (light only) */}
                  <Image
                    src="/assets/authlayout/light/Ellipse 11.svg"
                    alt=""
                    width={693}
                    height={306}
                    className="pointer-events-none absolute -top-[140px] -right-[80px] h-[306px] w-[693px] opacity-90 dark:hidden"
                  />

                  {/* Actual form content sits above the glow */}
                  <div className="relative z-10">
                    {/* Heading */}
                    <div className="mb-8 text-center">
                      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                        Create an account
                      </h1>
                      <p className="mt-2 text-[0.95rem] md:text-base text-slate-500 dark:text-slate-300">
                        Enter your details to create your Sense PC account
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* First Name */}
                      <div className="space-y-2">
                        <div className="relative">
                          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                          id="first-name"
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          data-testid="signup-first-name-input"
                          uiSize="lg"
                          className="pl-11"
                        />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <div className="relative">
                          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                        id="last-name"
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        data-testid="signup-last-name-input"
                        uiSize="lg"
                        className="pl-11"
                      />

                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          data-testid="signup-email-input"
                          uiSize="lg"
                          className="pl-11"
                        />

                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            data-testid="signup-password-input"
                            uiSize="lg"
                            className="pl-11 pr-11"
                          />

                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            data-testid="signup-confirm-password-input"
                            uiSize="lg"
                            className="pl-11 pr-11"
                          />

                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Terms of service */}
                      <div className="mt-1">
                        <label className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-300">
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

                      {/* Submit button – gradient + arrow, like Figma */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        size="lg"
                        data-testid="signup-submit-button"
                        className={cn(
                          "mt-3 w-full rounded-full text-sm font-medium",
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

                    {/* Social login + footer (outside form) */}
                    <div className="mt-6 space-y-4">
                      {/* Divider: Or continue with */}
                      <div className="flex items-center text-sm">
                        <span className="h-px flex-1 bg-slate-200/70 dark:bg-white/10" />
                        <span className="mx-3 text-slate-400 dark:text-slate-300">
                          Or continue with
                        </span>
                        <span className="h-px flex-1 bg-slate-200/70 dark:bg-white/10" />
                      </div>

                      {/* Google + Apple buttons */}
                      <SocailLogin />

                      <p className="text-center text-sm text-slate-400 dark:text-slate-300">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="font-semibold text-link-primary hover:underline"
                          onClick={() => router.push("/auth")}
                        >
                          Login
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* END right col */}
            </div>
          </PublicCard>
        </div>
      </div>

      {/* OTP dialog on top of signup page */}
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
