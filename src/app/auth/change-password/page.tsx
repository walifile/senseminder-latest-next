
/* eslint perfectionist/sort-imports: "off" */

"use client";

import type { RootState } from "@/redux/store";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { confirmSignIn } from "aws-amplify/auth";

import { setLoading, setTempUser } from "@/redux/slices/auth/auth-slice";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleSignOut } from "@/lib/services/auth";

import { useForm } from "react-hook-form";
import { Form, Field } from "@/components/shared/hook-form";
import { routes } from "@/constants/routes";
import Link from "next/link";


type ChangePasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const tempUser = useSelector((state: RootState) => state.auth.tempUser);
  const { toast } = useToast();

  const [isChanging, setIsChanging] = useState(false);

  const methods = useForm<ChangePasswordFormValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    setError,
  } = methods;

  useEffect(() => {
    if (!tempUser) router.push(routes.auth);;
  }, [tempUser, router]);

  const onSubmit = async (data: ChangePasswordFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        message: "Passwords do not match.",
      });
      return;
    }

    dispatch(setLoading(true));
    setIsChanging(true);

    try {
      const result = await confirmSignIn({
        challengeResponse: data.newPassword,
      });

      if (result.isSignedIn) {
        await handleSignOut();
        toast({
          title: "Password changed!",
          description: "You can now log in with your new password.",
        });
        dispatch(setTempUser(null));
        router.push(routes.auth);
      } else {
        toast({
          title: "Unexpected response",
          description: "Please try logging in again.",
          variant: "destructive",
        });
      router.push(routes.auth);      }
    } catch (err) {
      toast({
        title: "Failed to change password",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 -mx-8 -mt-8 mb-4 rounded-t-2xl" />

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Change Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Please choose a unique password to secure your account
        </p>
      </div>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Field.Text
            name="newPassword"
            label="New Password"
            type="password"
            placeholder="Enter new password"
          />

          <Field.Text
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
          />
        </div>

        <Button
          type="submit"
          disabled={isChanging}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed mt-6"
        >
          {isChanging ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Changing...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={routes.auth} className="text-blue-600 hover:underline">
          Back to Sign in
        </Link>

      </p>
    </div>
  );
}
