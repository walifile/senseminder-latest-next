"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";
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
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
            <DialogTitle className="text-base md:text-lg font-semibold">
                You are about to stop{" "}
                <span className="italic font-bold tracking-tight text-yellow-800 dark:text-yellow-400">
                    {desktopName}
                </span>{" "}
                <span className="not-italic font-medium text-black dark:text-white">
                    computer
                </span>.
            </DialogTitle>

            <DialogDescription className="mt-2 flex items-start gap-3 text-sm text-yellow-700 bg-yellow-100/80 p-3 rounded-md border border-yellow-200">
                <AlertTriangle className="h-5 w-5 mt-2.5 text-yellow-600 shrink-0" />
                <span>
                    If your PC is using an <strong>Hourly Plan</strong>, SSD storage charges will continue even after stopping your Sense PC,
                    since the disk remains allocated to preserve your data.
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
};
