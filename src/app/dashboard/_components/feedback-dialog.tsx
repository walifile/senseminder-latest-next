import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import FeedbackForm from "./feedback-form";

type Props = {
  open: boolean;
  onClose: () => void;
};

const FeedbackDialog = ({ open, onClose }: Props) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Share Your Feedback</DialogTitle>
        <DialogDescription>
          We value your input to help us improve our services.
        </DialogDescription>
      </DialogHeader>

      <FeedbackForm onClose={onClose} />
    </DialogContent>
  </Dialog>
);

export default FeedbackDialog;
