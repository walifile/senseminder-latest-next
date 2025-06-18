"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import {
  handleGoogleSignUp as googleSignUpService,
  handleAppleSignUp as appleSignUpService,
} from "@/lib/services/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { routes } from "@/constants/routes";

const SocailLogin = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      await googleSignUpService();

      router.push(routes?.dashboard);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Google sign-up failed.");
      toast({
        title: "Google Sign-up Failed",
        description: error.message,
      });
      console.error("Google Sign-up Error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      setIsAppleLoading(true);
      await appleSignUpService();
      router.push(routes?.dashboard);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Apple sign-up failed.");
      toast({
        title: "Apple Sign-up Failed",
        description: error.message,
      });
      console.error("Apple Sign-up Error:", error);
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading}
          className="w-full border-gray-200 bg-white/50 text-gray-700 hover:bg-gray-50 dark:border-[#ffffff1a] dark:bg-[#ffffff0f] dark:text-white dark:hover:bg-[#ffffff1a] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
              Google
            </span>
          ) : (
            <>
              <FcGoogle className="mr-2 h-4 w-4" />
              Google
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleAppleSignUp}
          disabled={isAppleLoading}
          className="w-full border-gray-200 bg-white/50 text-gray-700 hover:bg-gray-50 dark:border-[#ffffff1a] dark:bg-[#ffffff0f] dark:text-white dark:hover:bg-[#ffffff1a] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isAppleLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
              Apple
            </span>
          ) : (
            <>
              <FaApple className="mr-2 h-4 w-4" />
              Apple
            </>
          )}
        </Button>
      </div>
    </>
  );
};

export default SocailLogin;
