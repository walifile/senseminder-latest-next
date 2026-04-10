"use client";

import type { ApiUser } from "@/app/dashboard/users/types";

import { useMemo, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, Field } from "@/components/shared/hook-form";

import { businessOnboardingInviteUserSchema } from "../schema";

import type { BusinessOnboardingInviteUserFormValues } from "../schema";

type InviteUsersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isInviting: boolean;
  invitedUsers: ApiUser[];
  onInviteUser: (
    values: BusinessOnboardingInviteUserFormValues,
  ) => boolean | Promise<boolean>;
  onPrevious: () => void;
  onNext: () => void;
};

export function InviteUsersDialog({
  open,
  onOpenChange,
  isInviting,
  invitedUsers,
  onInviteUser,
  onPrevious,
  onNext,
}: InviteUsersDialogProps) {
  const defaultValues = useMemo<BusinessOnboardingInviteUserFormValues>(
    () => ({
      email: "",
      role: "member",
    }),
    [],
  );

  const methods = useForm<BusinessOnboardingInviteUserFormValues>({
    resolver: zodResolver(businessOnboardingInviteUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (!open) return;

    reset(defaultValues);
  }, [defaultValues, open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const didInvite = await onInviteUser(values);

    if (didInvite) {
      reset({
        email: "",
        role: values.role,
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[calc(100vw-1rem)] sm:w-[min(94vw,76rem)] max-w-none max-h-[90dvh] p-0 overflow-y-auto md:overflow-hidden",
          "bg-white dark:bg-[#000624]",
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10 bg-[#F5FAFE] dark:bg-white/5">
            <DialogHeader className="text-left space-y-3">
              <div className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs md:text-sm bg-[#2530F0]/10 text-[#2530F0] dark:bg-white/10 dark:text-[#B9C2D5]">
                Business onboarding
              </div>
              <DialogTitle className="!text-2xl md:!text-3xl !leading-tight">
                Invite admins and members
              </DialogTitle>
              <DialogDescription className="!text-sm md:!text-base text-paragraph">
                Invite your team now so access can be assigned quickly after
                launch. You can send multiple invites from this step.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-3">
              {[
                "Admins can manage desktops and team operations",
                "Members can access only assigned SensePC resources",
                "You can resend or manage invites later in User Management",
              ].map((item) => (
                <div
                  key={item}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm md:text-base",
                    "bg-white dark:bg-[#FFFFFF08]",
                    "border border-black/5 dark:border-white/10",
                  )}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10 space-y-6">
            <Form methods={methods} onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <p className="text-[14px] font-semibold uppercase tracking-[-0.2px] text-[#2530F0] dark:text-[#8EA2FF]">
                  Invite users
                </p>
                <p className="text-paragraph text-sm md:text-base">
                  Add an email, choose a role, and send invitation.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_170px_auto] md:items-start">
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[1fr_170px]">
                    <Field.Text
                      name="email"
                      type="email"
                      label="Email"
                      placeholder="teammate@company.com"
                      inputVariant="auth"
                      className="gap-2"
                      labelClassName="text-sm font-medium text-slate-700 dark:text-slate-200"
                      inputClassName="justify-start h-auto px-5 py-4 placeholder:font-normal font-['Inter'] leading-6 !border-0 !ring-0 !outline-none"
                      inputTestId="onboarding-invite-email-input"
                    />

                    <Field.Select
                      name="role"
                      label="Role"
                      placeholder="Select a role"
                      selectVariant="glowingSelector"
                      className="gap-2"
                      labelClassName="text-sm font-medium text-slate-700 dark:text-slate-200"
                      triggerClassName="h-[52px] text-base font-semibold font-['Inter'] leading-6"
                      triggerTestId="onboarding-invite-role-select"
                      options={[
                        { value: "admin", label: "Admin" },
                        { value: "member", label: "Member" },
                      ]}
                    />
                  </div>
                </div>

                <div className="md:pt-9">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-l from-[#a801ba] to-[#2530f0]"
                    disabled={isInviting || isSubmitting}
                  >
                    {isInviting || isSubmitting ? "Inviting..." : "Invite"}
                  </Button>
                </div>
              </div>
            </Form>

            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-[#FFFFFF08]">
              <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Invited users and status
                </p>
              </div>
              <div className="max-h-[280px] overflow-y-auto divide-y divide-black/5 dark:divide-white/10">
                {invitedUsers.length > 0 ? (
                  invitedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.email}</p>
                        <p className="text-xs text-paragraph capitalize">{u.role}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "capitalize",
                          u.status?.toLowerCase() === "active"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-300",
                        )}
                      >
                        {u.status || "pending"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-paragraph">
                    No invites sent yet.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" size="lg" onClick={onPrevious}>
                Previous
              </Button>
              <Button
                type="button"
                size="lg"
                className="bg-gradient-to-l from-[#a801ba] to-[#2530f0]"
                onClick={onNext}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
