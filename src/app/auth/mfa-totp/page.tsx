/* eslint perfectionist/sort-imports: "off" */

"use client";

import type { RootState } from "@/redux/store";
import Image from "next/image";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { routes } from "@/constants/routes";
import React, { useState, useEffect } from "react";
import { sendTotpRecovery } from "@/api/mfa-recovery";
import { setLoading, setTempUser } from "@/redux/slices/auth/auth-slice";
import { maskEmail } from "@/lib/utils/index";
import { Button } from "@/components/ui/button";
import { getSessionItemSafe } from "@/lib/utils/browser";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { confirmSignIn } from "aws-amplify/auth";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { handleSignOut, handlePostAuthentication } from "@/lib/services/auth";


export default function MfaTotpPage() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [recoverySending, setRecoverySending] = useState(false);
  const [loginEmail, setLoginEmail] = useState<string>("");

  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();

  const tempUser = useSelector((state: RootState) => state.auth.tempUser);

  useEffect(() => {
    if (!tempUser) {
      toast({
        title: "Session expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
      router.push(routes.auth);
      return;
    }

    const storedEmail = getSessionItemSafe("mfaEmail");

    if (storedEmail) {
      setLoginEmail(storedEmail);
    }
  }, [tempUser, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;

    setSubmitting(true);
    dispatch(setLoading(true));

    try {
      const result = await confirmSignIn({ challengeResponse: code });

      if (result.isSignedIn) {
        const finalResult = await handlePostAuthentication();
        if (finalResult.success) {
          // cleanup
          dispatch(setTempUser(null));
          sessionStorage.removeItem("tempUserMFA");
          sessionStorage.removeItem("mfaOptions");
          sessionStorage.removeItem("mfaEmail");

          toast({
            title: "Logged in",
            description: "MFA verification successful!",
          });
          router.push(routes.dashboard);
        } else {
          throw new Error("Login finalization failed.");
        }
      } else if (result.nextStep?.signInStep?.startsWith("CONFIRM_SIGN_IN")) {
        toast({
          title: "Incorrect code",
          description: "Please check your authenticator app and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const err = error as Error & { name?: string; message?: string };
      if (
        err?.name === "CodeMismatchException" ||
        err?.message?.toLowerCase?.().includes("invalid code")
      ) {
        toast({
          title: "Incorrect code",
          description: "That code didn’t match. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification failed",
          description:
            err instanceof Error ? err.message : "Something went wrong.",
          variant: "destructive",
        });
        await handleSignOut();
        router.push(routes.auth);
      }
    } finally {
      setSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  const handleTotpRecoveryRequest = async () => {
    if (!loginEmail) {
      toast({
        title: "Cannot send recovery",
        description:
          "We could not detect your login email. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRecoverySending(true);
      await sendTotpRecovery(loginEmail);
      toast({
        title: "Recovery email sent",
        description: `Check your inbox for instructions at ${maskEmail(
          loginEmail
        )}.`,
      });
      setRecoveryDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to send recovery email.",
        variant: "destructive",
      });
    } finally {
      setRecoverySending(false);
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
        MFA Authenticator Verification
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code from your authenticator app
      </p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(val) => setCode(val)}
          disabled={submitting}
        >
          <InputOTPGroup>
            {[...Array(6)].map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Verifying..." : "Continue"}
      </Button>
    </form>

    <div className="text-center text-sm text-muted-foreground">
      Lost access to your Authenticator App?{" "}
      <button
        onClick={() => setRecoveryDialogOpen(true)}
        className="text-blue-600 hover:underline"
      >
        Request recovery
      </button>
    </div>
    <p className="text-center text-sm text-muted-foreground">
      <a href="/auth" className="text-blue-600 hover:underline">
        Back to Sign in
      </a>
    </p>

    <Dialog open={recoveryDialogOpen} onOpenChange={setRecoveryDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recover Authenticator Access</DialogTitle>
          <DialogDescription>
            We'll send a link to disable your Authenticator App to:
            <br />
            <span className="font-medium">
              {loginEmail ? loginEmail : "—"}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button
            variant="ghost"
            onClick={() => setRecoveryDialogOpen(false)}
            disabled={recoverySending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTotpRecoveryRequest}
            disabled={recoverySending || !loginEmail}
          >
            {recoverySending ? "Sending..." : "Send Recovery Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
