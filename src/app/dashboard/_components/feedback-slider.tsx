"use client";

import React from "react";

import FeedbackForm from "./feedback-form";

type Props = {
  open: boolean;
  onClose: () => void;
};

const FeedbackSlider = ({ open, onClose }: Props) => (
  <>
    <div
      data-testid="dashboard-feedback-overlay"
      onClick={onClose}
      className={`fixed inset-0 bg-black/40 transition-opacity z-[9999] ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    />

    <div
      data-testid="dashboard-feedback-slider"
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-xl border-l transition-transform duration-300 z-[99999] ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Share Your Feedback</h2>
        <p className="text-sm text-muted-foreground">
          We value your input to help us improve our services.
        </p>
      </div>

      <div className="p-4">
        <FeedbackForm onClose={onClose} />
      </div>
    </div>
  </>
);

export default FeedbackSlider;
