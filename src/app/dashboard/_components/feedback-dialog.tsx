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
    <DialogContent
      data-testid="dashboard-feedback-dialog"
      className="sm:max-w-[425px] font-['Space_Grotesk']"
    >
      <DialogHeader className="font-['Space_Grotesk']">
        <DialogTitle className="font-['Space_Grotesk']">
          Share Your Feedback
        </DialogTitle>
        <DialogDescription className="font-['Space_Grotesk']">
          We value your input to help us improve our services.
        </DialogDescription>
      </DialogHeader>

      <div className="font-['Space_Grotesk']">
        <FeedbackForm onClose={onClose} />
      </div>
    </DialogContent>
  </Dialog>
);

export default FeedbackDialog;
