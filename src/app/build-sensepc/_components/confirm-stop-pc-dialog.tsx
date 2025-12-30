"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { AlertTriangle } from "lucide-react";

type ConfirmStopModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  desktopName: string;
  isStopping: boolean;
};

export const ConfirmStopModal: React.FC<ConfirmStopModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  desktopName,
  isStopping,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent
      className="
        bg-background text-foreground
        border border-border
        shadow-lg
      "
    >
      <DialogHeader>
        <DialogTitle className="text-base md:text-lg font-semibold text-foreground">
          You are about to stop{" "}
          <span className="italic font-bold tracking-tight text-amber-700 dark:text-amber-400">
            {desktopName}
          </span>{" "}
          <span className="not-italic font-medium text-foreground">computer</span>.
        </DialogTitle>

        <DialogDescription
          className="
            mt-2 flex items-start gap-3 text-sm
            rounded-md border p-3
            bg-muted/40 text-foreground
            border-border
            dark:bg-muted/20
          "
        >
          <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-foreground/90">
            If your PC is using an <strong className="text-foreground">Hourly Plan</strong>, SSD storage
            charges will continue even after stopping your Sense PC, since the
            disk remains allocated to preserve your data.
          </span>
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="gap-2">
        <Button onClick={onClose} variant="outline" disabled={isStopping}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="destructive" disabled={isStopping}>
          {isStopping ? "Stopping..." : "Yes, Stop it"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
