// import React, { useEffect, useState } from "react";
// import {
//   CognitoIdentityProviderClient,
//   AssociateSoftwareTokenCommand,
//   VerifySoftwareTokenCommand,
//   SetUserMFAPreferenceCommand,
// } from "@aws-sdk/client-cognito-identity-provider";
// import { fetchAuthSession } from "aws-amplify/auth";
// import QRCode from "react-qr-code";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";

// type MfaTotpDialogProps = {
//   open: boolean;
//   onClose: () => void;
//   onComplete: () => void;
// };

// export default function MfaTotpDialog({ open, onClose, onComplete }: MfaTotpDialogProps) {
//   const { toast } = useToast();

//   const [secretCode, setSecretCode] = useState<string | null>(null);
//   const [session, setSession] = useState<string | null>(null);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [userCode, setUserCode] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [verifying, setVerifying] = useState(false);

//   useEffect(() => {
//     if (!open) return;

//     const setupTotp = async () => {
//       setLoading(true);
//       try {
//         const session = await fetchAuthSession();
//         const access = session.tokens?.accessToken?.toString();
//         if (!access) throw new Error("Access token missing");

//         setAccessToken(access);

//         const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
//         const command = new AssociateSoftwareTokenCommand({ AccessToken: access });
//         const response = await client.send(command);

//         if (!response.SecretCode) throw new Error("No secret code returned");

//         setSecretCode(response.SecretCode);
//         setSession(response.Session ?? null);
//       } catch (err) {
//         toast({
//           title: "Error",
//           description: "Failed to initialize TOTP setup.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     setupTotp();
//   }, [open]);

//   const handleVerify = async () => {
//     if (userCode.length !== 6) {
//       toast({
//         title: "Invalid code",
//         description: "Please enter a 6-digit code.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setVerifying(true);
//     try {
//       const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

//       const verifyCommand = new VerifySoftwareTokenCommand({
//         UserCode: userCode,
//         ...(session ? { Session: session } : { AccessToken: accessToken! }),
//       });

//       const response = await client.send(verifyCommand);

//       if (response.Status !== "SUCCESS") throw new Error("Invalid verification code");

//       // ✅ Final step: Set TOTP as the preferred MFA method
//       const setMfaCommand = new SetUserMFAPreferenceCommand({
//         AccessToken: accessToken!,
//         SoftwareTokenMfaSettings: {
//           Enabled: true,
//           PreferredMfa: true,
//         },
//       });

//       await client.send(setMfaCommand);

//       toast({
//         title: "TOTP Enabled",
//         description: "You have successfully enabled authenticator-based MFA.",
//       });
//       onComplete();
//     } catch (err) {
//       toast({
//         title: "Verification Failed",
//         description: "Please check the code and try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setVerifying(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Setup Authenticator App</DialogTitle>
//           <DialogDescription>
//             Scan this QR code with your Authenticator App (Google Authenticator, Authy, etc.)
//           </DialogDescription>
//         </DialogHeader>

//         {loading ? (
//           <p className="text-sm text-muted-foreground">Loading QR Code...</p>
//         ) : secretCode ? (
//           <>
//             <div className="flex flex-col items-center space-y-4">
//               <div className="bg-white p-4 rounded">
//                 <QRCode
//                   value={`otpauth://totp/SmartPC?secret=${secretCode}&issuer=SmartPC`}
//                   size={200}
//                 />
//               </div>
//               <Input
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={6}
//                 placeholder="Enter 6-digit code"
//                 className="text-center tracking-widest"
//                 value={userCode}
//                 onChange={(e) => setUserCode(e.target.value.replace(/\D/g, ""))}
//               />
//             </div>
//             <DialogFooter className="pt-4">
//               <Button variant="ghost" onClick={onClose}>
//                 Cancel
//               </Button>
//               <Button onClick={handleVerify} disabled={verifying}>
//                 {verifying ? "Verifying..." : "Confirm"}
//               </Button>
//             </DialogFooter>
//           </>
//         ) : (
//           <p className="text-sm text-destructive">Failed to load QR code.</p>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

import React, { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import {
  VerifySoftwareTokenCommand,
  SetUserMFAPreferenceCommand,
  CognitoIdentityProviderClient,
  AssociateSoftwareTokenCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import QRCode from "react-qr-code";

import { useToast } from "@/hooks/use-toast";

type MfaTotpDialogProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export default function MfaTotpDialog({
  open,
  onClose,
  onComplete,
}: MfaTotpDialogProps) {
  const { toast } = useToast();

  const [secretCode, setSecretCode] = useState<string | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!open) return;

    const setupTotp = async () => {
      setLoading(true);
      try {
        const session = await fetchAuthSession();
        const access = session.tokens?.accessToken?.toString();
        if (!access) throw new Error("Access token missing");

        setAccessToken(access);

        // ✅ Fetch email for QR label
        const attributes = await fetchUserAttributes();
        const email = attributes.email;
        setUserEmail(email || null);

        const client = new CognitoIdentityProviderClient({
          region: "us-east-1",
        });
        const command = new AssociateSoftwareTokenCommand({
          AccessToken: access,
        });
        const response = await client.send(command);

        if (!response.SecretCode) throw new Error("No secret code returned");

        setSecretCode(response.SecretCode);
        setSession(response.Session ?? null);
      } catch {
        toast({
          title: "Error",
          description: "Failed to initialize TOTP setup.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    setupTotp();
  }, [open, toast]);

  const handleVerify = async () => {
    if (userCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

      const verifyCommand = new VerifySoftwareTokenCommand({
        UserCode: userCode,
        ...(session ? { Session: session } : { AccessToken: accessToken! }),
      });

      const response = await client.send(verifyCommand);

      if (response.Status !== "SUCCESS")
        throw new Error("Invalid verification code");

      // ✅ Final step: Set TOTP as the preferred MFA method
      const setMfaCommand = new SetUserMFAPreferenceCommand({
        AccessToken: accessToken!,
        SoftwareTokenMfaSettings: {
          Enabled: true,
          PreferredMfa: true,
        },
      });

      await client.send(setMfaCommand);

      toast({
        title: "TOTP Enabled",
        description: "You have successfully enabled authenticator-based MFA.",
      });
      onComplete();
    } catch {
      toast({
        title: "Verification Failed",
        description: "Please check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  // 🧠 Construct TOTP URI with email in label
  const qrValue =
    userEmail && secretCode
      ? `otpauth://totp/SmartPC:${encodeURIComponent(
          userEmail
        )}?secret=${secretCode}&issuer=SmartPC`
      : "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setup Authenticator App</DialogTitle>
          <DialogDescription>
            Scan this QR code with your Authenticator App (Google Authenticator,
            Authy, etc.)
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading QR Code...</p>
        ) : secretCode && userEmail ? (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded">
                <QRCode value={qrValue} size={200} />
              </div>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                className="text-center tracking-widest"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={verifying}>
                {verifying ? "Verifying..." : "Confirm"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <p className="text-sm text-destructive">Failed to load QR code.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
