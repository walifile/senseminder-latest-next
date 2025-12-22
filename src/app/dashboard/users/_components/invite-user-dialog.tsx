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

import { toast } from "@/hooks/use-toast";

import { Form, Field } from "@/components/shared/hook-form";

import { formSchema } from "../schema";

import type { FormValues } from "../schema";

type Props = {
  open: boolean;
  onClose: () => void;
};

const InviteUserDialog = ({ open, onClose }: Props) => {
  const [inviteUser] = useInviteUserMutation();

  const defaultValues: Partial<FormValues> = useMemo(
    () => ({
      name: "",
      email: "",
      role: "",
    }),
    []
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

  // Handlers
  const onSubmit = handleSubmit(async (data) => {
    try {
      await inviteUser({ ...data, group: "" }).unwrap();

      toast({
        title: "User invited",
        description: `An invitation has been sent to ${data.email}`,
      });
      closeDialog();
    } catch (e) {
      toast({
        title: "Failed to invite user",
        variant: "destructive",
        description: getErrorMessage(e, "Failed to invite user"),
      });
    }
  });

  // Close dialog
  const closeDialog = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent
        data-testid="dashboard-users-invite-dialog"
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to a new user. They will receive an email to set
            up their account.
          </DialogDescription>
        </DialogHeader>
        <Form
          data-testid="dashboard-users-invite-form"
          methods={methods}
          onSubmit={onSubmit}
          className="space-y-2"
        >
          <Field.Text
            name="name"
            label="Name"
            placeholder="John Doe"
            inputClassName="justify-start h-auto px-5 py-4 text-paragraph text-base font-normal placeholder:font-normal font-['Inter'] leading-6"
          />

          <Field.Text
            name="email"
            label="Email"
            placeholder="john.doe@example.com"
            inputClassName="justify-start h-auto px-5 py-4 text-paragraph text-base font-normal placeholder:font-normal font-['Inter'] leading-6"
          />

          <Field.Select
            name="role"
            label="Role"
            placeholder="Select a role"
            className="gap-2"
            triggerClassName="h-[52px] text-base font-semibold font-['Inter'] leading-6"
            options={[
              { value: "admin", label: "Admin" },
              { value: "member", label: "Member" },
            ]}
          />
          <DialogFooter className="!mt-6">
            <Button variant="default" size="lg" className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;
