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
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Field } from "@/components/shared/hook-form";
import { z } from "zod";
import { schemaHelper } from "../../../components/shared/hook-form/schema-helper";

function getFeedbackContent(context: string) {
  switch (context) {
    case "pc-creation":
      return {
        title: "How was your PC creation experience?",
        description:
          "Help us improve our VM creation process by sharing your thoughts.",
      };
    case "payment":
      return {
        title: "How was your payment experience?",
        description: "Your feedback helps us improve our billing process.",
      };
    case "remote-session":
      return {
        title: "How was your remote session?",
        description: "Tell us about your experience connecting to your VM.",
      };
    case "storage":
      return {
        title: "How was your storage experience?",
        description: "Help us improve our storage management features.",
      };
    default:
      return {
        title: "Share Your Feedback",
        description: "We value your input to help us improve our services.",
      };
  }
}

// Feedback form schema
const feedbackSchema = z.object({
  type: schemaHelper.select("Type"),
  rating: schemaHelper.number("Rating", { min: 1, max: 5 }),
  comment: schemaHelper.textarea("Comment", { required: false }),
  context: schemaHelper.select("Context", { required: false }),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

const FeedbackDialog = ({ open, onClose }: Props) => {
  const context: string = "general";

  const { title, description } = useMemo(
    () => getFeedbackContent(context),
    [context]
  );

  const defaultValues: Partial<FeedbackFormValues> = useMemo(
    () => ({
      type: "",
      rating: 0,
      comment: "",
      context,
    }),
    [context]
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
      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate you taking the time to help us improve.",
      });
      closeDialog();
    } catch (e: any) {
      toast({
        title: "Failed to submit feedback",
        variant: "destructive",
        description: (e && e.message) || "Please try again later.",
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form methods={methods} onSubmit={onSubmit} className="space-y-4">
          <Field.Select
            name="type"
            label="Feedback Type"
            placeholder="Select feedback type"
            options={[
              { value: "bug", label: "Bug Report" },
              { value: "feature-request", label: "Feature Request" },
              { value: "general", label: "General Feedback" },
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
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
