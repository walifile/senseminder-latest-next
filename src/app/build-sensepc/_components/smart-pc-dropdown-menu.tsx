"use client";

import React, { useState } from "react";
import { useRestartVMMutation } from "@/api/fileManagerAPI";

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
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  AlertTriangle,
  CalendarClock,
  Cpu,
  HardDrive, // ✅ SSD icon
  MoreVertical,
  Moon,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import type { DesktopInstance } from "../types";

type Props = {
  pc: DesktopInstance;
  isMember: boolean;
  setSelectedInstance: (instance: DesktopInstance | null) => void;
  openPCResizeDialog: (pc: DesktopInstance) => void;
  openStorageDialog: (pc: DesktopInstance) => void;
  handleSchedule: () => void;
  handleIdle: () => void;
  handleAssignUser: () => void;
  handleDelete: () => void;
};

const SmartPcDropdownMenu = ({
  pc,
  isMember,
  setSelectedInstance,
  openPCResizeDialog,
  openStorageDialog,
  handleSchedule,
  handleIdle,
  handleAssignUser,
  handleDelete,
}: Props) => {
  const plan = pc.billingPlan?.toLowerCase() || "";
  const planRestricted = !plan || plan === "daily" || plan === "monthly";

  const state = pc.state?.toLowerCase() || "";
  const isRunning = state === "running";
  const isStopped = state === "stopped";

  const { toast } = useToast();
  const [restartVM, { isLoading: isRebooting }] = useRestartVMMutation();
  const [isRebootDialogOpen, setIsRebootDialogOpen] = useState(false);

  const openRebootDialog = () => {
    if (!isRunning) {
      toast({
        title: "PC must be running",
        description: "You can only reboot a running Sense PC.",
        variant: "destructive",
      });
      return;
    }
    setIsRebootDialogOpen(true);
  };

  const handleConfirmReboot = async () => {
    if (!pc.instanceId) {
      setIsRebootDialogOpen(false);
      return;
    }

    try {
      await restartVM(pc.instanceId).unwrap();
      toast({
        title: "Computer Rebooting",
        description:
          "Your PC will reboot and disconnect all remote sessions. Please reconnect in about 1–2 minutes from dashboard.",
      });
    } catch (error) {
      Logger.error("RestartVM error from dropdown:", error);
      toast({
        title: "Failed to Reboot Computer",
        description:
          "Unable to reboot the computer. Please wait a few moments and try again.",
        variant: "destructive",
      });
    } finally {
      setIsRebootDialogOpen(false);
    }
  };

  // ✅ Rules:
  // - PC Resize: only when STOPPED + Hourly plan
  // - Add Volume: only when RUNNING + Hourly plan (so starting/stopping/etc are disabled)
  // - Assign User: only when STOPPED
  const resizeDisabled = planRestricted || !isStopped;
  const addVolumeDisabled = planRestricted || !isRunning;
  const assignUserDisabled = !isStopped;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" data-testid="sensepc-more-button">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {/* Schedule */}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInstance(pc);
              handleSchedule();
            }}
          >
            <CalendarClock className="h-4 w-4 mr-2" />
            Schedule
          </DropdownMenuItem>

          {/* Idle Settings */}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInstance(pc);
              handleIdle();
            }}
          >
            <Moon className="h-4 w-4 mr-2" />
            Idle Settings
          </DropdownMenuItem>

          {/* Reboot */}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              if (isRebooting) return;
              openRebootDialog();
            }}
            className={
              !isRunning || isRebooting
                ? "opacity-50 cursor-default select-none"
                : ""
            }
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isRebooting ? "Rebooting..." : "Reboot"}
          </DropdownMenuItem>

          {/* --- Tooltip-enabled restricted actions --- */}
          <TooltipProvider>
            {/* PC Resize */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (resizeDisabled) return;
                    openPCResizeDialog(pc);
                  }}
                  className={
                    resizeDisabled ? "opacity-50 cursor-default select-none" : ""
                  }
                  data-testid="sensepc-resize-button"
                >
                  <Cpu className="h-4 w-4 mr-2" />
                  PC Resize
                </DropdownMenuItem>
              </TooltipTrigger>
              {resizeDisabled && (
                <TooltipContent side="right">
                  {planRestricted
                    ? "Available only for PCs on Hourly plan"
                    : "Stop your PC to resize"}
                </TooltipContent>
              )}
            </Tooltip>

            {/* Add Volume */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (addVolumeDisabled) return;
                    openStorageDialog(pc);
                  }}
                  className={
                    addVolumeDisabled
                      ? "opacity-50 cursor-default select-none"
                      : ""
                  }
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Add Volume (SSD)
                </DropdownMenuItem>
              </TooltipTrigger>
              {addVolumeDisabled && (
                <TooltipContent side="right">
                  {planRestricted
                    ? "Available only for PCs on Hourly plan"
                    : "Add Volume is available only when your PC is running"}
                </TooltipContent>
              )}
            </Tooltip>

            {/* Assign User */}
            {!isMember && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (assignUserDisabled) return;
                      setSelectedInstance(pc);
                      handleAssignUser();
                    }}
                    className={
                      assignUserDisabled
                        ? "opacity-50 cursor-default select-none"
                        : ""
                    }
                    data-testid="sensepc-assign-user-button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign User
                  </DropdownMenuItem>
                </TooltipTrigger>
                {assignUserDisabled && (
                  <TooltipContent side="right">
                    Stop your PC to assign a user
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </TooltipProvider>

          <DropdownMenuSeparator />

          {/* Delete */}
          {!isMember && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInstance(pc);
                handleDelete();
              }}
              data-testid="sensepc-delete-button"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reboot confirmation dialog */}
      <Dialog
        open={isRebootDialogOpen}
        onOpenChange={(open) => {
          if (!isRebooting) setIsRebootDialogOpen(open);
        }}
      >
        <DialogContent
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg font-semibold">
              You are about to reboot{" "}
              <span className="italic font-bold tracking-tight text-yellow-800 dark:text-yellow-400">
                {pc.systemName}
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
            <Button
              variant="outline"
              onClick={() => setIsRebootDialogOpen(false)}
              disabled={isRebooting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReboot}
              disabled={isRebooting}
            >
              {isRebooting ? "Rebooting..." : "Yes, Reboot it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartPcDropdownMenu;
