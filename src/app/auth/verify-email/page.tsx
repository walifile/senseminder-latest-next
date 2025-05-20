"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your verification logic here
  };

  const handleResendCode = async () => {
    // Add your resend code logic here
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Verify Your Email
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We've sent a verification code to your email address. Please enter it
          below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="verification-code"
          >
            Verification Code
          </label>
          <Input
            id="verification-code"
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
            className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5]"
        >
          Verify Email
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={handleResendCode}
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Didn't receive the code? Click to resend
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/auth"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Sign in
        </Link>
      </p>
    </div>
  );
}
