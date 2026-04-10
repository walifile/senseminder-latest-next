"use client";

import { useInviteUserMutation } from "@/api/user";
import React, { useMemo, useCallback } from "react";

import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Mail,
  UserCog,
  UserPlus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";

import { Form, Field } from "@/components/shared/hook-form";

import { formSchema } from "../schema";

import type { FormValues } from "../schema";

type Props = {
  open: boolean;
  onClose: () => void;
};

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-300/60 bg-white/70 p-3.5 dark:border-zinc-700/60 dark:bg-zinc-900/60">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        inline-flex h-9 min-w-0 w-full items-center justify-center
        rounded-full border border-zinc-300/70 bg-white/80 px-3 py-1
        text-center text-[11px] font-medium leading-tight text-zinc-900 shadow-sm
        dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100
      "
    >
      <span className="block truncate text-center leading-tight">{children}</span>
    </div>
  );
}

const InviteUserDialog = ({ open, onClose }: Props) => {
  const [inviteUser] = useInviteUserMutation();

  const defaultValues: Partial<FormValues> = useMemo(
    () => ({
      name: "",
      email: "",
      role: "",
    }),
    [],
  );

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const closeDialog = useCallback(() => {
    if (isSubmitting) return;
    reset();
    onClose();
  }, [isSubmitting, reset, onClose]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await inviteUser({ ...data, group: "" }).unwrap();

      toast({
        title: "User invited",
        description: `An invitation has been sent to ${data.email}`,
      });

      reset();
      onClose();
    } catch (e) {
      const maybeData = (e as { data?: { code?: unknown } })?.data;
      const code =
        typeof maybeData?.code === "string" ? maybeData.code : undefined;

      const description =
        code === "EMAIL_ALREADY_EXISTS"
          ? "This email address is already invited."
          : getErrorMessage(e, "Failed to invite user");

      toast({
        title: "Failed to invite user",
        variant: "destructive",
        description,
      });
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
    >
      <DialogContent
        data-testid="user-management-invite-modal"
        closeTestId="user-management-close-modal-button"
        className="w-[min(92vw,44rem)] max-w-xl gap-0 overflow-hidden rounded-2xl border-zinc-300/60 p-0 dark:border-zinc-700/60"
      >
        <div className="flex max-h-[calc(100vh-2.5rem)] flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-zinc-300/50 px-6 pb-5 pt-6 dark:border-zinc-700/50">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(79,70,229,0.12)_0%,rgba(124,58,237,0.18)_100%)] ring-1 ring-inset ring-violet-300/40 dark:ring-violet-500/25">
                <UserPlus className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-left text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Invite User
                </DialogTitle>

                <DialogDescription asChild>
                  <div className="mt-2 space-y-3 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                    <p>
                      Invite a new user to your workspace. They will receive an
                      email with instructions to set up their account.
                    </p>
                    <p>
                      Choose the appropriate role before sending the invitation.
                    </p>
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <InfoCard
                  icon={<Mail className="h-4 w-4" />}
                  title="Email invitation"
                  description="An invite email will be sent to the user."
                />
                <InfoCard
                  icon={<UserCog className="h-4 w-4" />}
                  title="Role-based access"
                  description="Select the correct role before sending."
                />
                <InfoCard
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Controlled onboarding"
                  description="The user joins through the invitation flow."
                />
              </div>

              <div className="rounded-xl border border-zinc-300/60 bg-white/65 p-3 dark:border-zinc-700/60 dark:bg-zinc-900/55">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                    Invitation flow
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-700 dark:text-zinc-200">
                    Enter details, choose a role, and send the invite.
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                  <StepPill>Details</StepPill>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                  <StepPill>Role</StepPill>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                  <StepPill>Invite sent</StepPill>
                </div>
              </div>

              <Form
                data-testid="dashboard-users-invite-form"
                methods={methods}
                onSubmit={onSubmit}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <Field.Text
                    name="name"
                    label="Name"
                    inputVariant="auth"
                    placeholder="John Doe"
                    inputClassName="justify-start h-[36px] px-3 py-1 text-sm placeholder:font-normal font-['Inter'] leading-4 !border-0 !ring-0 !outline-none"
                    inputTestId="user-management-name-input"
                  />

                  <Field.Text
                    name="email"
                    label="Email"
                    inputVariant="auth"
                    placeholder="john.doe@example.com"
                    inputClassName="justify-start h-[36px] px-3 py-1 text-sm placeholder:font-normal font-['Inter'] leading-4 !border-0 !ring-0 !outline-none"
                    inputTestId="user-management-email-input"
                  />

                  <Field.Select
                    name="role"
                    label="Role"
                    placeholder="Select a role"
                    selectVariant="glowingSelector"
                    className="gap-1"
                    triggerClassName="h-[36px] px-3 text-sm font-medium font-['Inter'] leading-4"
                    triggerTestId="user-management-role-dropdown"
                    options={[
                      { value: "admin", label: "Admin" },
                      { value: "member", label: "Member" },
                    ]}
                  />
                </div>

                <DialogFooter className="border-t border-zinc-300/50 px-0 pt-4 sm:justify-end dark:border-zinc-700/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={isSubmitting}
                    className="border-zinc-300/60 bg-white/75 text-zinc-900 transition-all hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="default"
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="user-management-send-invitation-button"
                    className="bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_55%,#C026D3_100%)] text-white shadow-[0_10px_30px_-12px_rgba(124,58,237,0.55)] hover:opacity-95"
                  >
                    {isSubmitting ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </Form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;