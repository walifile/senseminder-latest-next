"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const staticPassword = process.env.NEXT_PUBLIC_STATIC_PASSWORD || "Sense@123";

export default function PasswordRequiredPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password === staticPassword) {
        const hashedPassword = await hashPassword(password);
        document.cookie = `passwordHash=${hashedPassword}; path=/; max-age=${
          60 * 60 * 24 * 7
        }`;

        toast({
          title: "Access granted!",
          description: "You can now access the protected pages.",
        });

        const returnUrl = searchParams.get("returnUrl") || "/";
        router.push(returnUrl);
      } else {
        toast({
          title: "Invalid password",
          description: "Please enter the correct password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword("");
    router.push("/");
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Access Required
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please enter the password to access this application
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Access"}
          </Button>
        </div>
      </form>
    </div>
  );
}
