"use client";

import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { QrCode } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  method: "app" | "sms" | "email" | null;
  onComplete: () => void;
}

export default function MfaMethodDialog({
  open,
  onClose,
  method,
  onComplete,
}: Props) {
  const [cooldown, setCooldown] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredEmail, setPreferredEmail] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ""));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendVerificationCode = async () => {
    if (cooldown > 0) return;
    setIsCodeSent(false);
    await new Promise((res) => setTimeout(res, 1000)); // Simulated API call
    setIsCodeSent(true);
    setCooldown(60);
    setVerificationCode("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="dashboard-mfa-method-dialog">
        <DialogHeader>
          <DialogTitle>
            {method === "app" && "Setup Authenticator App"}
            {method === "sms" && "Setup SMS Authentication"}
            {method === "email" && "Setup Email Authentication"}
          </DialogTitle>
          <DialogDescription>
            {method === "app" &&
              "Scan the QR code below with your authenticator app"}
            {method === "sms" &&
              "Enter your phone number to receive verification codes"}
            {method === "email" &&
              "We'll send verification codes to your email"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {method === "app" && (
            <>
              <div className="border border-border p-4 rounded-lg">
                <QrCode className="h-32 w-32 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Can’t scan the QR code? Enter this code manually:
                <br />
                <code className="font-mono bg-muted px-2 py-1 rounded mt-2 inline-block">
                  ABCD EFGH IJKL MNOP
                </code>
              </p>
            </>
          )}

          {method === "sms" && (
            <div className="space-y-4 w-full">
              <Label>Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setIsPhoneValid(validatePhoneNumber(e.target.value));
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={sendVerificationCode}
                  disabled={!isPhoneValid || cooldown > 0}
                >
                  {cooldown > 0
                    ? `Resend (${cooldown}s)`
                    : isCodeSent
                    ? "Resend"
                    : "Send Code"}
                </Button>
              </div>
              {isCodeSent && (
                <Input
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              )}
            </div>
          )}

          {method === "email" && (
            <div className="space-y-4 w-full">
              <Label>Email</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={preferredEmail}
                  onChange={(e) => {
                    setPreferredEmail(e.target.value);
                    setIsEmailValid(validateEmail(e.target.value));
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={sendVerificationCode}
                  disabled={!isEmailValid || cooldown > 0}
                >
                  {cooldown > 0
                    ? `Resend (${cooldown}s)`
                    : isCodeSent
                    ? "Resend"
                    : "Send Code"}
                </Button>
              </div>
              {isCodeSent && (
                <Input
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onComplete}>Enable</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
