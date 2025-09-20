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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to a new user. They will receive an email to set
            up their account.
          </DialogDescription>
        </DialogHeader>
        <Form methods={methods} onSubmit={onSubmit} className="space-y-4">
          <Field.Text name="name" label="Name" placeholder="John Doe" />

          <Field.Text
            name="email"
            label="Email"
            placeholder="john.doe@example.com"
          />

          <Field.Select
            name="role"
            label="Role"
            placeholder="Select a role"
            options={[
              { value: "admin", label: "Admin" },
              { value: "member", label: "Member" },
            ]}
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;
