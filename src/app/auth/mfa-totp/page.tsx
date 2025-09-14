"use client";

import type { RootState } from "@/redux/store";

import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import React, { useState, useEffect } from "react";
import { sendTotpRecovery } from "@/api/mfa-recovery";
import { setLoading, setTempUser } from "@/redux/slices/auth/auth-slice";

import { Input } from "@/components/ui/input";
import { maskEmail } from "@/lib/utils/index";
import { Button } from "@/components/ui/button";
import { getSessionItemSafe } from "@/lib/utils/browser";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

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
    } catch (err: any) {
      // If it’s just a wrong code, don’t sign the user out—let them retry.
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
    <>
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <Card className="w-full max-w-md border border-border/50 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Multi-Factor Authentication
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="6-digit code"
                maxLength={6}
                inputMode="numeric"
                pattern="\d{6}"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                disabled={submitting}
                className="text-center tracking-widest text-lg font-medium"
                required
              />
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || code.length !== 6}
              >
                {submitting ? "Verifying..." : "Confirm Code"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              This step helps secure your account.
            </p>

            <div className="text-center text-sm">
              <button
                onClick={() => setRecoveryDialogOpen(true)}
                className="text-blue-600 hover:underline"
                disabled={submitting}
              >
                Lost access to your Authenticator App? Request recovery
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={recoveryDialogOpen} onOpenChange={setRecoveryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recover Authenticator Access</DialogTitle>
            <DialogDescription>
              We’ll send a link to disable your Authenticator App to:
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
    </>
  );
}
