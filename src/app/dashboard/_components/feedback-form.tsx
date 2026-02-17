import type { RootState } from "@/redux/store";

import { usePathname } from "next/navigation";
import React, { useMemo, useCallback } from "react";
import { useSubmitFeedbackMutation } from "@/api/feedback";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

import { useSelector } from "react-redux";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "@/hooks/use-toast";
import useLocation from "@/hooks/use-location";

import { Form, Field, schemaHelper } from "@/components/shared/hook-form";

const feedbackSchema = z.object({
  type: schemaHelper.select("Type"),
  rating: schemaHelper.number("Rating", { min: 1, max: 5 }),
  comment: schemaHelper.textarea("Comment", { required: false }),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

type Props = {
  onClose: () => void;
};

const FeedbackForm = ({ onClose }: Props) => {
  const pathname = usePathname();
  const source = pathname?.split("/")[1] || "unknown";
  const { userLocation } = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [submitFeedback] = useSubmitFeedbackMutation();

  const defaultValues: Partial<FeedbackFormValues> = useMemo(
    () => ({
      type: "",
      rating: 0,
      comment: "",
    }),
    [],
  );

  const methods = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
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
      await submitFeedback({
        ...data,
        userId: user?.id,
        metadata: {
          page: pathname,
          browser: userLocation?.browser,
          os: userLocation?.os,
        },
        source,
      }).unwrap();

      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate you taking the time to help us improve.",
      });
      closeDialog();
    } catch {
      toast({
        title: "Failed to submit feedback",
        variant: "destructive",
        description: "Please try again later.",
      });
    }
  });

  // Close dialog
  const closeDialog = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return (
    <Form
      data-testid="dashboard-feedback-form"
      methods={methods}
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <Field.Select
        name="type"
        label="Feedback Type"
        placeholder="Select feedback type"
        contentClassName="z-[100000]"
        options={[
          { value: "general", label: "General Feedback" },
          { value: "feature", label: "Feature Request" },
          { value: "bug", label: "Bug Report" },
        ]}
      />

      <Field.Rating name="rating" label="Rating" />

      <Field.Text
        name="comment"
        label="Comments (Optional)"
        placeholder="Tell us more about your experience..."
        multiline
      />

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={closeDialog}
          className="w-full sm:w-auto"
        >
          Skip
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </DialogFooter>
    </Form>
  );
};

export default FeedbackForm;
