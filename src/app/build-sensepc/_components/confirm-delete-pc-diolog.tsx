"use client";

import { useState, useCallback } from "react";
import { useDeleteVMMutation } from "@/api/vmManagement";
import { useStopVMMutation } from "@/api/fileManagerAPI";
import { removeStartingInstance } from "@/redux/slices/dcv/starting-instances-slice";

import { Logger } from "@/lib/utils/logger";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogPortal,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogOverlay,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

import { useDispatch } from "react-redux";

import { Trash2, Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import type { DesktopInstance } from "../types";

type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  selectedInstance: DesktopInstance | null;
  setSelectedInstance: (instance: DesktopInstance | null) => void;
  onSuccess: () => void;
};

export const ConfirmDeleteModal = ({
  open,
  onClose,
  selectedInstance,
  setSelectedInstance,
  onSuccess,
}: ConfirmDeleteModalProps) => {
  const { toast } = useToast();

  const dispatch = useDispatch();

  const [isChecked, setIsChecked] = useState(false);

  const [deleteVM, { isLoading: isDeleting }] = useDeleteVMMutation();
  const [stopVM, { isLoading: isStopping }] = useStopVMMutation();

  const loading = isDeleting || isStopping;

  const handleConfirmDelete = async () => {
    if (!selectedInstance) return;
    try {
      const { instanceId, systemName, region, state } = selectedInstance;

      if (state === "running") {
        await stopVM(instanceId).unwrap();
      }
      if (!region) {
        Logger.warn(
          "Region is missing from Computer metadata:",
          selectedInstance
        );
        throw new Error("Missing region for selected Computer");
      }
      await deleteVM({ instanceId, region }).unwrap();
      toast({
        title: "Computer Deleted",
        description: `Computer "${systemName}" has been deleted successfully.`,
      });
      dispatch(removeStartingInstance(instanceId));
      onSuccess();
      closeDialog();
    } catch (error) {
      Logger.log("Delete Error:", error);
      toast({
        title: "Deletion Failed",
        description: `Failed to delete this Computer". Please try again.`,
        variant: "destructive",
      });
    }
  };

  const closeDialog = useCallback(() => {
    setIsChecked(false);
    setSelectedInstance(null);
    onClose();
  }, [onClose, setSelectedInstance]);

  return (
    <AlertDialog open={open} onOpenChange={closeDialog}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-black/50 backdrop-blur-sm transition-opacity" />
        <AlertDialogContent className="w-full max-w-lg rounded-2xl border border-border bg-white dark:bg-[#0B0B13] dark:border-[#2C2C37] shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-center text-gray-900 dark:text-white">
                Delete This Computer?
              </AlertDialogTitle>
              <p className="text-center text-base text-muted-foreground mt-1">
                You’re about to permanently delete{" "}
                <span className="font-medium text-foreground">
                  {selectedInstance?.systemName}
                </span>{" "}
                computer. This action can not be undone.
              </p>

              <TooltipProvider>
                <div className="mt-4 w-full rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300 p-3 text-sm">
                  I understand this will also{" "}
                  <strong>permanently delete</strong> all data on this Computer{" "}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="underline cursor-help text-yellow-900 dark:text-yellow-200">
                        SSD
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs text-xs leading-snug"
                    >
                      A Solid State Drive (SSD) is a data storage device that
                      uses integrated circuit assemblies to store data, unlike
                      traditional Hard Disk Drives (HDDs) which use spinning
                      disks. SSDs are known for their speed, reliability, and
                      durability due to the absence of moving parts.
                    </TooltipContent>
                  </Tooltip>
                  . If you wish to keep your data, please cancel and back it up
                  first.
                </div>
              </TooltipProvider>

              <div className="mt-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="delete-confirm"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 border rounded"
                  data-testid="sensepc-delete-confirm-checkbox"
                />
                <label
                  htmlFor="delete-confirm"
                  className="text-sm text-muted-foreground leading-snug"
                >
                  I acknowledge and accept the above statement.
                </label>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex justify-end gap-3">
            <AlertDialogCancel
              onClick={closeDialog}
              className="rounded-md border border-input bg-white dark:bg-transparent hover:bg-accent dark:hover:bg-[#ffffff0f] px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={!isChecked || loading}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-md px-5 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="sensepc-delete-confirm-button"
            >
              {loading ? (
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
