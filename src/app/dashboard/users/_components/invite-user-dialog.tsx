import React, { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { useInviteUserMutation } from "@/api/user";
import { formSchema, FormValues } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Field } from "@/components/shared/hook-form";

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
    } catch (e: any) {
      toast({
        title: "Failed to invite user",
        variant: "destructive",
        description: (e && e.message) || "Failed to invite user.",
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
