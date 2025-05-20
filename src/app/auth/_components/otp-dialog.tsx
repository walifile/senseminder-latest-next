"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

interface OTPDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  isLoading: boolean;
  isResending: boolean;
}

const OTPDialog = ({
  isOpen,
  onClose,
  onSubmit,
  onResend,
  isLoading,
  isResending,
}: OTPDialogProps) => {
  const [otp, setOtp] = useState("");

  const handleChange = (value: string) => {
    setOtp(value);
  };

  const handleSubmit = () => {
    if (otp.length === 6) {
      onSubmit(otp);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-6 space-y-6 bg-white dark:bg-[#0A0A1B]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center text-gray-900 dark:text-white">
            Enter Verification Code
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          We've sent a 6-digit code to your email. It will expire in 1 hour.
        </p>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={handleChange}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </Button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Didn’t receive the code?{" "}
            <Button
              type="button"
              variant="link"
              onClick={onResend}
              disabled={isResending}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto"
            >
              {isResending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Resend"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPDialog;
