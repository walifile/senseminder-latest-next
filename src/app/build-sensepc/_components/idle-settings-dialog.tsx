"use client";

import type { InstanceDetail } from "@/api/realtime";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  useGetIdleSettingsQuery,
  useSetIdleSettingsMutation,
  useDeleteIdleTimeoutMutation,
} from "@/api/smartPC-Idle-settings";

import { Logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { skipToken } from "@reduxjs/toolkit/query";

import {
  Power,
  Clock3,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { timeOptions } from "../data";
import { isNoneValue } from "../constants/idle-settings";

import type { DesktopInstance } from "../types";

type IdleSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  realtimePcInfo: Record<string, InstanceDetail>;
  selectedInstance: DesktopInstance | null;
  selectedPcOs?: string;
  onSuccess: () => void;
};

const IdleSettingsDialog: React.FC<IdleSettingsDialogProps> = ({
  open,
  onClose,
  selectedInstance,
  onSuccess,
}) => {
  const { toast } = useToast();

  const [setIdleSettings, { isLoading: isSetting }] =
    useSetIdleSettingsMutation();
  const [deleteIdleTimeout, { isLoading: isDeleting }] =
    useDeleteIdleTimeoutMutation();

  const [selectedTimeoutY, setSelectedTimeoutY] = useState<string>("");
  const [selectedSessionTimeoutX, setSelectedSessionTimeoutX] =
    useState<string>("");

  const queryArgs =
    open && selectedInstance
      ? { instanceId: selectedInstance.instanceId }
      : skipToken;

  const {
    data: idleSettings,
    error: loadError,
    isFetching,
    refetch,
  } = useGetIdleSettingsQuery(queryArgs);

  const isLoading = isFetching;
  const isSaving = isSetting || isDeleting;
  const disableInputs = !selectedInstance || isSaving;
  const loadErrorMessage = loadError
    ? getErrorMessage(loadError, "Failed to load idle settings")
    : null;
  const showForm = !isLoading && !loadErrorMessage;

  const closeDialog = useCallback(() => {
    if (isSaving) return;
    onClose();
  }, [onClose, isSaving]);

  const isDeleteMode = useMemo(
    () => isNoneValue(selectedTimeoutY),
    [selectedTimeoutY],
  );

  const timeoutYNumber = useMemo(() => {
    const n = Number(selectedTimeoutY);
    return Number.isFinite(n) ? n : NaN;
  }, [selectedTimeoutY]);

  const timeoutXNumber = useMemo(() => {
    const n = Number(selectedSessionTimeoutX);
    return Number.isFinite(n) ? n : NaN;
  }, [selectedSessionTimeoutX]);

  const expectedStopRange = useMemo(() => {
    if (isDeleteMode) return null;
    if (!Number.isInteger(timeoutYNumber) || timeoutYNumber < 0) return null;
    if (!Number.isInteger(timeoutXNumber) || timeoutXNumber < 0) return null;

    return {
      min: timeoutYNumber,
      max: timeoutXNumber + timeoutYNumber,
      x: timeoutXNumber,
      y: timeoutYNumber,
    };
  }, [isDeleteMode, timeoutXNumber, timeoutYNumber]);

  const summaryText = useMemo(() => {
    if (isDeleteMode) {
      return "Automatic idle disconnect and auto-stop will be removed.";
    }

    if (!expectedStopRange) {
      return "Choose both values to preview the idle policy.";
    }

    return `Disconnect after ${expectedStopRange.x} min idle. Stop after ${expectedStopRange.y} more min without an active session. Expected stop window: ${expectedStopRange.min}-${expectedStopRange.max} min.`;
  }, [expectedStopRange, isDeleteMode]);

  const handleSaveIdleSettings = async () => {
    if (!selectedInstance || isSaving) return;

    try {
      if (isDeleteMode) {
        await deleteIdleTimeout({
          instanceId: selectedInstance.instanceId,
        }).unwrap();

        toast({
          title: "Idle settings removed",
          description: `Idle settings were cleared for ${selectedInstance.systemName}.`,
        });

        onSuccess();
        onClose();
        return;
      }

      const timeoutY = Number(selectedTimeoutY);
      if (!Number.isInteger(timeoutY) || timeoutY < 0) {
        toast({
          title: "Invalid value",
          description: "Stop timeout must be 0 minutes or more.",
          variant: "destructive",
        });
        return;
      }

      const sessionTimeoutX = Number(selectedSessionTimeoutX);
      if (!Number.isInteger(sessionTimeoutX) || sessionTimeoutX < 0) {
        toast({
          title: "Invalid value",
          description: "Session timeout must be 0 minutes or more.",
          variant: "destructive",
        });
        return;
      }

      await setIdleSettings({
        instanceId: selectedInstance.instanceId,
        timeout: timeoutY,
        sessionTimeout: sessionTimeoutX,
      }).unwrap();

      toast({
        title: "Idle settings saved",
      });

      onSuccess();
      onClose();
    } catch (e) {
      Logger.error("Failed to save idle settings:", e);
      toast({
        title: "Idle settings change failed",
        description: getErrorMessage(e, "Could not update idle settings"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!open || !selectedInstance) {
      setSelectedTimeoutY("");
      setSelectedSessionTimeoutX("");
      return;
    }
  }, [open, selectedInstance]);

  useEffect(() => {
    if (!open || !selectedInstance || !idleSettings) return;

    setSelectedTimeoutY(
      typeof idleSettings.timeout === "number"
        ? String(idleSettings.timeout)
        : "30",
    );

    setSelectedSessionTimeoutX(
      typeof idleSettings.sessionTimeout === "number"
        ? String(idleSettings.sessionTimeout)
        : "60",
    );
  }, [open, selectedInstance, idleSettings]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
    >
      <DialogContent className="w-[min(92vw,36rem)] max-w-lg gap-0 overflow-hidden rounded-2xl border-zinc-300/60 p-0 dark:border-zinc-700/60">
        <DialogHeader className="border-b border-zinc-300/50 px-5 pb-4 pt-5 dark:border-zinc-700/50">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(79,70,229,0.12)_0%,rgba(124,58,237,0.18)_100%)] ring-1 ring-inset ring-violet-300/40 dark:ring-violet-500/25">
              <Clock3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-left text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Idle Settings
              </DialogTitle>
              <DialogDescription className="mt-1 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                Configure inactivity behavior for{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedInstance?.systemName || "this SensePC"}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-4">
          {isLoading && (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Loading idle settings...
              </p>
            </div>
          )}

          {!isLoading && loadErrorMessage && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-red-700 dark:text-red-300">
                {loadErrorMessage}
              </p>
              <Button
                variant="outline"
                className="h-9 rounded-full"
                onClick={() => void refetch()}
                disabled={isSaving}
              >
                Retry
              </Button>
            </div>
          )}

          {showForm && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-300/60 bg-white/70 p-3 dark:border-zinc-700/60 dark:bg-zinc-900/60">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700 dark:text-zinc-300" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Idle policy summary
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                      {summaryText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Session Timeout (X)
                  </Label>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Disconnect after X minutes of inactivity.
                  </p>

                  <Select
                    value={selectedSessionTimeoutX}
                    onValueChange={setSelectedSessionTimeoutX}
                    disabled={disableInputs || isDeleteMode}
                  >
                    <SelectTrigger variant="glowingSelector">
                      <SelectValue placeholder="Select X" />
                    </SelectTrigger>

                    <SelectContent>
                      {timeOptions.map((opt) => (
                        <SelectItem
                          key={`x-${opt.value}`}
                          value={String(opt.value)}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Stop Timeout (Y)
                  </Label>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Stop after Y minutes.
                  </p>

                  <Select
                    value={selectedTimeoutY}
                    onValueChange={setSelectedTimeoutY}
                    disabled={disableInputs}
                  >
                    <SelectTrigger variant="glowingSelector">
                      <SelectValue placeholder="Select Y" />
                    </SelectTrigger>

                    <SelectContent>
                      {timeOptions.map((opt) => (
                        <SelectItem
                          key={`y-${opt.value}`}
                          value={String(opt.value)}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isDeleteMode && expectedStopRange && (
                <div className="rounded-xl border border-zinc-300/60 bg-white/70 p-3 dark:border-zinc-700/60 dark:bg-zinc-900/60">
                  <div className="flex items-start gap-3">
                    <Power className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700 dark:text-zinc-300" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Expected stop window
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                        The PC may stop between{" "}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {expectedStopRange.min}-{expectedStopRange.max} minutes
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isDeleteMode && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Remove idle settings
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                    Saving with{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Stop Timeout = None
                    </span>{" "}
                    removes the idle timeout policy.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-zinc-300/50 px-5 py-4 sm:justify-end dark:border-zinc-700/50">
          <Button
            variant="outline"
            onClick={closeDialog}
            className="border-zinc-300/60 bg-white/75 text-zinc-900 transition-all hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
            disabled={isSaving}
          >
            Cancel
          </Button>

          {showForm && (
            <Button
              disabled={
                disableInputs ||
                selectedTimeoutY === "" ||
                (!isDeleteMode && selectedSessionTimeoutX === "")
              }
              onClick={handleSaveIdleSettings}
              className="bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_55%,#C026D3_100%)] text-white shadow-[0_10px_30px_-12px_rgba(124,58,237,0.55)] hover:opacity-95"
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : isDeleteMode ? (
                "Remove Idle Settings"
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IdleSettingsDialog;