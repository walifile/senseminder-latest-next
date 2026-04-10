"use client";

import { useDeleteVMMutation } from "@/api/vmManagement";
import { useStopVMMutation } from "@/api/fileManagerAPI";
import { useState, useCallback, type ReactNode } from "react";
import { removeStartingInstance } from "@/redux/slices/dcv/starting-instances-slice";

import { Logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useDispatch } from "react-redux";

import {
  Square,
  Trash2,
  Loader2,
  HardDrive,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import type { DesktopInstance } from "../types";

type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  selectedInstance: DesktopInstance | null;
  setSelectedInstance: (instance: DesktopInstance | null) => void;
  onSuccess: () => void;
};

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-300/60 bg-white/70 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/60">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepPill({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        flex h-10 min-w-0 flex-1 items-center justify-center
        rounded-full border border-zinc-300/70 bg-white/80 px-3
        text-center text-xs font-medium leading-tight text-zinc-900 shadow-sm
        dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100
      "
    >
      <span className="block truncate">{children}</span>
    </div>
  );
}

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

  const closeDialog = useCallback(() => {
    if (loading) return;
    setIsChecked(false);
    setSelectedInstance(null);
    onClose();
  }, [loading, onClose, setSelectedInstance]);

  const handleConfirmDelete = async () => {
    if (!selectedInstance) return;

    try {
      const { instanceId, systemName, region, state } = selectedInstance;

      if (state === "running") {
        await stopVM(instanceId).unwrap();
      }

      if (!region) {
        Logger.warn("Region is missing from Computer metadata:", selectedInstance);
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
        description: "Failed to delete this Computer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
    >
      <DialogContent className="w-[min(92vw,44rem)] max-w-xl gap-0 overflow-hidden rounded-2xl border-zinc-300/60 p-0 dark:border-zinc-700/60">
        <div className="flex max-h-[calc(100vh-2.5rem)] flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-zinc-300/50 px-6 pb-5 pt-6 dark:border-zinc-700/50">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(220,38,38,0.12)_0%,rgba(220,38,38,0.18)_100%)] ring-1 ring-inset ring-red-300/40 dark:ring-red-500/25">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-left text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Delete Sense PC
                </DialogTitle>

                <DialogDescription asChild>
                  <div className="mt-2 space-y-3 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                    <p>
                      You are about to permanently delete{" "}
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedInstance?.systemName ?? "this computer"}
                      </span>
                      . This action cannot be undone.
                    </p>

                    <p>
                      If the computer is currently running, SensePC will stop it
                      first and then continue with permanent deletion.
                    </p>
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <InfoCard
                  icon={<ShieldAlert className="h-4 w-4" />}
                  title="Permanent action"
                  description="This PC will be deleted permanently."
                />
                <InfoCard
                  icon={<HardDrive className="h-4 w-4" />}
                  title="Back up first"
                  description="Save important files to Sense Cloud first."
                />
                <InfoCard
                  icon={<Square className="h-4 w-4" />}
                  title="If running"
                  description="The PC will stop before deletion."
                />
              </div>

              <div className="rounded-2xl border border-zinc-300/60 bg-white/65 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/55">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                    What happens next
                  </p>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                    After confirmation, SensePC will stop the computer if needed
                    and then remove the computer and its allocated storage.
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <StepPill>Confirm</StepPill>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                  <StepPill>Stop if running</StepPill>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                  <StepPill>Delete PC</StepPill>
                </div>
              </div>

              <TooltipProvider>
                <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Important
                      </p>

                      <p className="mt-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                        This permanently deletes the computer and all data on its{" "}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help underline decoration-dotted underline-offset-2">
                              SSD
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                            A Solid State Drive (SSD) is the storage device attached to the
                            computer. Deleting the computer also removes data stored on that disk.
                          </TooltipContent>
                        </Tooltip>
                        . Before continuing, move any files you need to retain to{" "}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          Sense Cloud
                        </span>{" "}
                        or another approved backup location.
                      </p>
                    </div>
                  </div>
                </div>
              </TooltipProvider>

              <div className="rounded-xl border border-zinc-300/60 bg-white/70 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/60">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="delete-confirm"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border"
                    data-testid="sensepc-delete-confirm-checkbox"
                    disabled={loading}
                  />

                  <label
                    htmlFor="delete-confirm"
                    className="text-sm leading-6 text-zinc-700 dark:text-zinc-200"
                  >
                    I understand this action is permanent. Any files I want to keep
                    should be backed up, including to Sense Cloud, before deleting
                    this computer.
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-zinc-300/50 px-6 py-4 sm:justify-end dark:border-zinc-700/50">
            <Button
              onClick={closeDialog}
              variant="outline"
              disabled={loading}
              className="border-zinc-300/60 bg-white/75 text-zinc-900 transition-all hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Cancel
            </Button>

            <Button
              onClick={handleConfirmDelete}
              disabled={!isChecked || loading}
              className="bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm transition-all hover:from-red-700 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              data-testid="sensepc-delete-confirm-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Computer"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};