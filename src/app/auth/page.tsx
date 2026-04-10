"use client";

import Image from "next/image";
import React, { useState } from "react";
import { routes } from "@/constants/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { useClaimSessionIfAvailableMutation } from "@/api/session";

import { cn } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicCard } from "@/components/ui/public-card";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Eye, Mail, Lock, EyeOff } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { handleSignIn } from "@/lib/services/auth";

import { Form } from "@/components/shared/hook-form";

import SocailLogin from "./_components/socail-login";
import { MfaTotpDialog } from "./_components/mfa-totp-dialog";
import { MfaEmailDialog } from "./_components/mfa-email-dialog";
import { MfaSelectDialog } from "./_components/mfa-select-dialog";
import { ForgotPasswordDialog } from "./_components/forgot-password-dialog";
import { OtpVerificationDialog } from "./_components/otp-verification-dialog";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [claimSessionIfAvailable] = useClaimSessionIfAvailableMutation();

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isMfaSelectOpen, setIsMfaSelectOpen] = useState(false);
  const [isMfaTotpOpen, setIsMfaTotpOpen] = useState(false);
  const [isMfaEmailOpen, setIsMfaEmailOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: LoginFormValues) => {
    const { email, password } = data;

    try {
      setIsLoading(true);

      const response = await handleSignIn(email, password);
      Logger.log("Login Response:", response);

      if ("nextStep" in response) {
        Logger.log("Cognito Next Step:", response.nextStep);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: (
            <span data-testid="login-success-message">
              Logged in successfully!
            </span>
          ),
        });

        try {
          await claimSessionIfAvailable().unwrap();
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

        sessionStorage.setItem("verificationEmail", email);
        setOtpEmail(email);
        setIsOtpOpen(true);
      } else if ("mfaRequired" in response && response.mfaRequired) {
        toast({
          title: "MFA Required",
          description:
            "We sent a code to your email. Please enter it to continue.",
        });

        sessionStorage.setItem("mfaEmail", email);
        setIsMfaEmailOpen(true);
      } else if ("mfaTotp" in response && response.mfaTotp) {
        toast({
          title: "Authenticator Code Required",
          description:
            "Please enter the 6-digit code from your Authenticator App.",
        });

        sessionStorage.setItem("mfaEmail", email);
        setIsMfaTotpOpen(true);
      } else if ("chooseMFA" in response && response.chooseMFA) {
        toast({
          title: "Choose MFA Method",
          description: "Select how you want to verify your login.",
        });

        sessionStorage.setItem(
          "tempUserMFA",
          JSON.stringify(response.signInResult)
        );
        sessionStorage.setItem("mfaEmail", email);
        sessionStorage.setItem(
          "mfaOptions",
          JSON.stringify(response.mfaOptions)
        );

        setIsMfaSelectOpen(true);
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
    <>
      <div className="w-full px-4 pb-10 pt-24 md:px-6 md:pb-14 md:pt-20 lg:pt-[150px]">
        <div className="mx-auto w-full max-w-[1280px]">
          <PublicCard
            className={cn(
              "relative mx-auto w-full max-w-[940px] overflow-hidden rounded-[28px]"
            )}
          >
            <div className="relative z-10 grid gap-6 px-5 py-6 md:px-7 md:py-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.78fr)] lg:items-center lg:gap-8 lg:px-8 lg:py-8">
              <div className="flex items-start justify-center lg:justify-start">
                <div className="w-full max-w-[430px] space-y-4">
                  <div className="space-y-3">
                    <h2 className="font-space-grotesk text-[24px] font-bold leading-[1.15] text-slate-900 dark:text-white md:text-[25px]">
                      Access your Sense PC account
                    </h2>
                  </div>

                  <div className="relative w-full max-w-[400px]">
                    <Image
                      src="/assets/authlayout/light/login-illustration.svg"
                      alt="Sense PC cloud infrastructure illustration"
                      width={622}
                      height={650}
                      priority
                      className="h-auto w-full object-contain dark:hidden"
                    />
                    <Image
                      src="/assets/authlayout/light/login-illustration-dark.svg"
                      alt="Sense PC cloud infrastructure illustration"
                      width={622}
                      height={650}
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
                        Log in
                      </div>
                    </div>

                    <Form
                      methods={methods}
                      onSubmit={handleSubmit(onSubmit)}
                      submitOnEnter
                    >
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              {...register("email")}
                              data-testid="dashboard-email-input"
                              uiSize="lg"
                              intent={errors.email ? "error" : "default"}
                              aria-invalid={!!errors.email}
                              className="h-9 pl-10 text-sm"
                            />
                          </div>
                          {errors.email && (
                            <p className="text-xs text-red-500">
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              {...register("password")}
                              data-testid="login-password-input"
                              uiSize="lg"
                              intent={errors.password ? "error" : "default"}
                              aria-invalid={!!errors.password}
                              className="h-9 pl-10 pr-10 text-sm"
                            />

                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                              onClick={() => setShowPassword((prev) => !prev)}
                              tabIndex={-1}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-xs text-red-500">
                              {errors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                          <label
                            htmlFor="rememberMe"
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id="rememberMe"
                              checked={rememberMe}
                              onCheckedChange={(checked) =>
                                setRememberMe(checked === true)
                              }
                              className="h-3 w-3"
                            />
                            <span>Remember Me</span>
                          </label>
                          <button
                            type="button"
                            className="text-[11px] font-medium text-link-primary hover:underline"
                            onClick={() => setIsForgotOpen(true)}
                          >
                            Forget Password?
                          </button>
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className={cn(
                            "mt-3 h-9 w-full rounded-full text-sm font-medium",
                            "bg-gradient-to-l from-[#a801ba] to-[#2530f0]",
                            "hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                          )}
                          disabled={isLoading}
                          data-testid="login-button"
                        >
                          {isLoading ? "Logging in..." : "Log-in"}
                        </Button>
                      </div>
                    </Form>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center text-xs">
                        <span className="h-px flex-1 bg-slate-200/70 dark:bg-white/10" />
                        <span className="mx-3 text-slate-400 dark:text-slate-300">
                          Or login with
                        </span>
                        <span className="h-px flex-1 bg-slate-200/70 dark:bg-white/10" />
                      </div>

                      <SocailLogin />

                      <p className="text-center text-xs text-slate-400 dark:text-slate-300">
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          className="font-semibold text-link-primary hover:underline"
                          onClick={() => router.push(routes.signUp)}
                          data-testid="signup-link-button"
                        >
                          Sign up
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

      <ForgotPasswordDialog
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />

      <MfaSelectDialog
        isOpen={isMfaSelectOpen}
        onClose={() => setIsMfaSelectOpen(false)}
        onRequireTotp={() => {
          setIsMfaSelectOpen(false);
          setIsMfaTotpOpen(true);
        }}
        onRequireEmail={() => {
          setIsMfaSelectOpen(false);
          setIsMfaEmailOpen(true);
        }}
      />

      <MfaTotpDialog
        isOpen={isMfaTotpOpen}
        onClose={() => setIsMfaTotpOpen(false)}
      />

      <MfaEmailDialog
        isOpen={isMfaEmailOpen}
        onClose={() => setIsMfaEmailOpen(false)}
      />

      <OtpVerificationDialog
        isOpen={isOtpOpen}
        email={otpEmail}
        onClose={() => setIsOtpOpen(false)}
        otpInputTestId="dashboard-mfa-input"
        submitButtonTestId="dashboard-verify-code-button"
      />
    </>
  );
}