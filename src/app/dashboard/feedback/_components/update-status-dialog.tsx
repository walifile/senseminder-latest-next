import React, { useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "@/hooks/use-toast";

import { Form, Field, schemaHelper } from "@/components/shared/hook-form";

import type { ApiFeedback } from "../types";

const updateStatusSchema = z.object({
  status: schemaHelper.select("Status", { required: true }),
  notes: schemaHelper.textarea("Internal Notes", { required: false }),
});

type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  selectedFeedback: ApiFeedback | null;
};

const UpdateStatusDialog = ({ open, onClose, selectedFeedback }: Props) => {
  const defaultValues: Partial<UpdateStatusFormValues> = useMemo(
    () => ({
      status: selectedFeedback?.status || "",
      notes: "",
    }),
    [selectedFeedback]
  );

  const methods = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedFeedback) return;

    try {
      toast({
        title: "Status updated successfully",
        description: `Feedback status changed to ${data.status}`,
      });
      closeDialog();
    } catch {
      toast({
        title: "Failed to update status",
        variant: "destructive",
        description: "Please try again later.",
      });
    }
  });

  const closeDialog = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent
        data-testid="dashboard-feedback-update-status-dialog"
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Update Feedback Status</DialogTitle>
          <DialogDescription>
            Update the status for feedback from{" "}
            {selectedFeedback?.userName || selectedFeedback?.userEmail}
          </DialogDescription>
        </DialogHeader>

        <Form
          data-testid="dashboard-feedback-update-status-form"
          methods={methods}
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <Field.Select
            name="status"
            label="Status"
            placeholder="Select status"
            options={[
              { value: "pending", label: "Pending" },
              { value: "in-progress", label: "In Progress" },
              { value: "resolved", label: "Resolved" },
              { value: "rejected", label: "Rejected" },
            ]}
          />

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusDialog;
