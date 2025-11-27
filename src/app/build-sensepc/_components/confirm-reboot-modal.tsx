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

type ConfirmRebootModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  desktopName: string;
  isRebooting: boolean;
};

export const ConfirmRebootModal: React.FC<ConfirmRebootModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  desktopName,
  isRebooting,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-base md:text-lg font-semibold">
          You are about to reboot{" "}
          <span className="italic font-bold tracking-tight text-yellow-800 dark:text-yellow-400">
            {desktopName}
          </span>{" "}
          <span className="not-italic font-medium text-black dark:text-white">
            computer
          </span>
          .
        </DialogTitle>

        <DialogDescription className="mt-2 flex items-start gap-3 text-sm text-yellow-700 bg-yellow-100/80 p-3 rounded-md border border-yellow-200">
          <AlertTriangle className="h-5 w-5 mt-2.5 text-yellow-600 shrink-0" />
          <span>
            Rebooting will disconnect all active remote connections. Your Sense
            PC may take about <strong>1–2 minutes</strong> to finish rebooting.
            After that, you&apos;ll need to{" "}
            <strong>connect again from the dashboard</strong>
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2">
        <Button onClick={onClose} variant="outline" disabled={isRebooting}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="destructive" disabled={isRebooting}>
          {isRebooting ? "Rebooting..." : "Yes, Reboot it"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
