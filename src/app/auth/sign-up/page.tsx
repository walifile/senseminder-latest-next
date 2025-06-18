"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { handleSignUp } from "@/lib/services/auth";
import { useToast } from "@/hooks/use-toast";
import SocailLogin from "../_components/socail-login";
export default function SignUp() {
  const router = useRouter();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        email,
        password,
        firstName,
        lastName,
        // Uncomment and add additional fields as needed
        // lastName: data.lastName,
        // country: data.country,
        // cellphone: data.cellphone,
        // organization: data.organizationName,
      };

      const response = await handleSignUp(data);

      if (response.success) {
        // Show success toast
        toast({
          title: "Success",
          description:
            "Account created successfully! Please verify your email.",
        });

        // Store email for OTP verification
        sessionStorage.setItem("verificationEmail", email);

        // Redirect to OTP verification page
        router.push("/auth/verify-otp");
      } else {
        // Show error toast
        toast({
          title: "Error",
          description: response.error || "Something went wrong!",
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      toast({
        title: "Unexpected Error",
        description: error.message || "Something went wrong!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Create an Account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your details to create your smart PC account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="first-name"
          >
            First Name
          </label>
          <Input
            id="first-name"
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="last-name"
          >
            Last Name
          </label>
          <Input
            id="last-name"
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="email"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="password"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500 dark:bg-[#ffffff0f] dark:border-[#ffffff1a] dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            required
            className="border-gray-200 data-[state=checked]:bg-blue-500 dark:border-[#ffffff1a]"
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            I accept the{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              terms and conditions
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-[#ffffff1a]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/80 px-2 text-gray-500 dark:bg-[#0A0A1B]/40 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>
      <SocailLogin />
      {/* <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="w-full border-gray-200 bg-white/50 text-gray-700 hover:bg-gray-50 dark:border-[#ffffff1a] dark:bg-[#ffffff0f] dark:text-white dark:hover:bg-[#ffffff1a]"
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          className="w-full border-gray-200 bg-white/50 text-gray-700 hover:bg-gray-50 dark:border-[#ffffff1a] dark:bg-[#ffffff0f] dark:text-white dark:hover:bg-[#ffffff1a]"
        >
          <FaApple className="mr-2 h-4 w-4" />
          Apple
        </Button>
      </div> */}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/auth"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
