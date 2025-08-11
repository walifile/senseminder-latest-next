// // /auth/mfa-totp/page.tsx

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { confirmSignIn } from 'aws-amplify/auth';
// import { useDispatch, useSelector } from 'react-redux';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast';
// import { RootState } from '@/redux/store';
// import { setTempUser, setLoading } from '@/redux/slices/auth-slice';
// import { handlePostAuthentication, handleSignOut } from '@/lib/services/auth';

// export default function MfaTotpPage() {
//   const [code, setCode] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const { toast } = useToast();
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const tempUser = useSelector((state: RootState) => state.auth.tempUser);

//   useEffect(() => {
//     if (!tempUser) {
//       toast({
//         title: 'Session Expired',
//         description: 'Please sign in again to continue.',
//         variant: 'destructive',
//       });
//       router.push('/auth');
//     }
//   }, [tempUser, router, toast]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!tempUser) return;

//     setSubmitting(true);
//     dispatch(setLoading(true));

//     try {
//       const result = await confirmSignIn({
//         challengeResponse: code,
//       });

//       if (result.isSignedIn) {
//         // Fully log the user in
//         const finalResult = await handlePostAuthentication();

//         if (finalResult.success) {
//           dispatch(setTempUser(null));
//           toast({
//             title: 'Logged in',
//             description: 'MFA verification successful!',
//           });
//           router.push('/dashboard/smart-pc');
//           //window.location.href = '/dashboard/smart-pc'; // Fallback for SSR

//         } else {
//           throw new Error("Login finalization failed.");
//         }
//       } else if (result.nextStep?.signInStep?.startsWith('CONFIRM_SIGN_IN')) {
//         toast({
//           title: 'Incorrect Code',
//           description: 'Please check your authenticator app and try again.',
//           variant: 'destructive',
//         });
//       }
//     } catch (err) {
//       toast({
//         title: 'Verification Failed',
//         description:
//           err instanceof Error ? err.message : 'Something went wrong.',
//         variant: 'destructive',
//       });
//       await handleSignOut();
//       router.push('/auth');
//     } finally {
//       setSubmitting(false);
//       dispatch(setLoading(false));
//     }
//   };

//   return (
//     <div className="min-m-screen flex items-center justify-center px-4 bg-background">
//       <Card className="w-full max-w-md border border-border/50 shadow-xl rounded-2xl overflow-hidden">
//         <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
//         <CardHeader className="text-center space-y-1">
//           <CardTitle className="text-2xl font-semibold tracking-tight">
//             Multi-Factor Authentication
//           </CardTitle>
//           <CardDescription>
//             Enter the 6-digit code from your authenticator app
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <Input
//               type="text"
//               placeholder="6-digit code"
//               maxLength={6}
//               inputMode="numeric"
//               pattern="\d{6}"
//               value={code}
//               onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
//               disabled={submitting}
//               className="text-center tracking-widest text-lg font-medium"
//               required
//             />
//             <Button
//               type="submit"
//               className="w-full"
//               disabled={submitting || code.length !== 6}
//             >
//               {submitting ? 'Verifying...' : 'Confirm Code'}
//             </Button>
//           </form>
//           <p className="text-xs text-muted-foreground text-center">
//             This step helps secure your account.
//           </p>

//         </CardContent>
//       </Card>
//     </div>
//   );

// }

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { confirmSignIn } from "aws-amplify/auth";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { setTempUser, setLoading } from "@/redux/slices/auth/auth-slice";
import { handlePostAuthentication, handleSignOut } from "@/lib/services/auth";
import { sendTotpRecovery } from "@/api/mfa-recovery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function MfaTotpPage() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySending, setRecoverySending] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();

  const tempUser = useSelector((state: RootState) => state.auth.tempUser);

  useEffect(() => {
    if (!tempUser) {
      toast({
        title: "Session Expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
      router.push("/auth");
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
          dispatch(setTempUser(null));
          toast({
            title: "Logged in",
            description: "MFA verification successful!",
          });
          router.push("/dashboard/smart-pc");
        } else {
          throw new Error("Login finalization failed.");
        }
      } else if (result.nextStep?.signInStep?.startsWith("CONFIRM_SIGN_IN")) {
        toast({
          title: "Incorrect Code",
          description: "Please check your authenticator app and try again.",
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
      setSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  const handleTotpRecoveryRequest = async () => {
    if (!recoveryEmail || !recoveryEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRecoverySending(true);
      await sendTotpRecovery(recoveryEmail);
      toast({
        title: "Recovery Email Sent",
        description:
          "Check your inbox for instructions to disable your Authenticator App.",
      });
      setRecoveryDialogOpen(false);
      setRecoveryEmail("");
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
              Enter your account email and we’ll send a link to disable your
              Authenticator App.
            </DialogDescription>
          </DialogHeader>

          <Input
            type="email"
            placeholder="your@email.com"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            disabled={recoverySending}
          />

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
              disabled={recoverySending}
            >
              {recoverySending ? "Sending..." : "Send Recovery Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
