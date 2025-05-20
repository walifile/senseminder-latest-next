"use client";

import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  desktopName?: string;
  isDeleting?: boolean;
};

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  desktopName,
  isDeleting,
}: ConfirmDeleteModalProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-black/50 backdrop-blur-sm transition-opacity" />
        <AlertDialogContent className="w-full max-w-lg rounded-2xl border border-border bg-white dark:bg-[#0B0B13] dark:border-[#2C2C37] shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-center text-gray-900 dark:text-white">
                Delete SmartPC?
              </AlertDialogTitle>
              <p className="text-center text-base text-muted-foreground mt-1">
                You’re about to permanently delete{" "}
                <span className="font-medium text-foreground">
                  {desktopName}
                </span>
                .
                <br />
                This action cannot be undone.
              </p>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex justify-end gap-3">
            <AlertDialogCancel
              onClick={onClose}
              className="rounded-md border border-input bg-white dark:bg-transparent hover:bg-accent dark:hover:bg-[#ffffff0f] px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-md px-5 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
