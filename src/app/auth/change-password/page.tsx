
"use client";

import type { RootState } from "@/redux/store";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import React, { useState, useEffect } from "react";
import { setLoading, setTempUser } from "@/redux/slices/auth/auth-slice";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { confirmSignIn } from "aws-amplify/auth";

import { useDispatch, useSelector } from "react-redux";

import { useForm } from "react-hook-form";

import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { handleSignOut } from "@/lib/services/auth";

import { Form, Field } from "@/components/shared/hook-form";


type ChangePasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const tempUser = useSelector((state: RootState) => state.auth.tempUser);
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (!tempUser) router.push(routes.auth);
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
          router.push(routes.auth);
        }
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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.push(routes.auth);
      }}
    >
      <DialogContent className="w-full max-w-[480px] p-8">
        <div className="w-full flex flex-col items-center gap-5">
          <div className="flex justify-center">
            <Image
              src={
                isDark
                  ? "/assets/authlayout/dark/sensepc-logo-dark.png"
                  : "/assets/authlayout/light/sensepc-logo-code.png"
              }
              alt="SensePC Logo"
              width={243}
              height={60}
              className="h-[60px] w-auto"
              priority
            />
          </div>

          <DialogHeader className="items-center text-center">
            <DialogTitle className="self-center text-center">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-center">
              Please choose a unique password to secure your account.
            </DialogDescription>
          </DialogHeader>

          <Form
            methods={methods}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4 mt-1"
          >
            <div className="space-y-4">
              <Field.Text
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                type="password"
                inputVariant="auth"
                inputUiSize="lg"
              />

              <Field.Text
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm new password"
                type="password"
                inputVariant="auth"
                inputUiSize="lg"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isChanging}
              size="lg"
              className="
                w-full
                rounded-full
                bg-gradient-to-l from-[#A801BA] to-[#2530F0]
                hover:opacity-90
                text-sm font-medium
                border-0
              "
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

          <p className="mt-2 text-sm text-center text-muted-foreground">
            Remember your password?{" "}
            <Link
              href={routes.auth}
              className="font-medium text-link-primary hover:underline"
            >
              Back to Sign in
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
