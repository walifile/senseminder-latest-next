
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { setLoading, setTempUser } from "@/redux/slices/auth/auth-slice";

import { Logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from "@/components/ui/input-otp";
import {
  Form,
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { confirmSignIn } from "aws-amplify/auth";

import { useDispatch } from "react-redux";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { handleSignOut, handlePostAuthentication } from "@/lib/services/auth";

const formSchema = z.object({
  code: z
    .string()
    .min(6, "Your MFA code must be 6 digits.")
    .max(6, "Your MFA code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function MfaEmailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const stored = sessionStorage.getItem("tempUserMFA");
    if (!stored) {
      toast({
        title: "Session Expired",
        description: "Please login again.",
        variant: "destructive",
      });
      router.push("/auth");
      return;
    }

    let user: unknown;
    try {
      user = JSON.parse(stored);
      Logger.log(user);
    } catch {
      toast({
        title: "Invalid Session",
        description: "Could not resume your session. Please login again.",
        variant: "destructive",
      });
      router.push("/auth");
      return;
    }

    setIsVerifying(true);
    dispatch(setLoading(true));

    try {
      const result = await confirmSignIn({
        challengeResponse: data.code,
      });

      if (result.isSignedIn) {
        const finalResult = await handlePostAuthentication();

        if (finalResult.success) {
          dispatch(setTempUser(null));
          toast({
            title: "Logged in",
            description: "MFA verification successful!",
          });
          router.push("/dashboard/smart-pc");
        } else {
          throw new Error("Login finalization failed.");
        }
      } else {
        toast({
          title: "Incorrect Code",
          description: "Please check your email and try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Verification Failed",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
      await handleSignOut();
      router.push("/auth");
    } finally {
      setIsVerifying(false);
      dispatch(setLoading(false));
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
      <h1 className="text-2xl font-semibold tracking-tight">
        MFA Email Verification
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code sent to your email
      </p>
    </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isVerifying}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"

        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </Form>
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
