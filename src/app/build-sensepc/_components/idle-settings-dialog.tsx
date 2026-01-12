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

import { Info, Loader2 } from "lucide-react";

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

  const [infoOpen, setInfoOpen] = useState(false);

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

  const handleSaveIdleSettings = async () => {
    if (!selectedInstance) return;
    if (isSaving) return;

    try {
      if (isDeleteMode) {
        await deleteIdleTimeout({
          instanceId: selectedInstance.instanceId,
        }).unwrap();
        toast({
          title: "Idle Settings Removed",
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
          description: "Stop timeout (Y) must be an integer >= 0 (minutes).",
          variant: "destructive",
        });
        return;
      }
      const sessionTimeoutX = Number(selectedSessionTimeoutX);
      if (!Number.isInteger(sessionTimeoutX) || sessionTimeoutX < 0) {
        toast({
          title: "Invalid value",
          description: "Session timeout (X) must be an integer >= 0 (minutes).",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Saving idle settings...",
        description: "This can take a few seconds.",
      });

      await setIdleSettings({
        instanceId: selectedInstance.instanceId,
        timeout: timeoutY,
        sessionTimeout: sessionTimeoutX,
      }).unwrap();

      toast({
        title: "Idle Settings Saved",
      });

      onSuccess();
      onClose();
    } catch (e) {
      Logger.error("Failed to save idle settings:", e);
      toast({
        title: "Idle Settings Change Failed",
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

  const disableInputs = !selectedInstance || isSaving;

  return (
    <>
      <Dialog open={open} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-[24px] leading-8 tracking-[-0.4px] font-semibold">
              Idle Settings
            </DialogTitle>

            <DialogDescription className="text-[14px] leading-5 tracking-[-0.2px]">
              Configure inactivity rules for{" "}
              <span className="font-medium">{selectedInstance?.systemName}</span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 h-px w-full bg-black/10 dark:bg-white/15" />

          {isLoading && (
            <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Loading idle settings...
              </p>
            </div>
          )}

          {!isLoading && loadErrorMessage && (
            <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3 text-center">
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
            <>
              <div className="mt-4 space-y-3">
                <Label className="text-[16px] leading-6 tracking-[-0.3px] font-semibold">
                  Session Timeout (X)
                </Label>

                <p className="text-[13px] leading-5 text-muted-foreground">
                  Disconnect the SensePC connection after{" "}
                  <span className="font-medium">X</span> minutes of inactivity.
                </p>

                <Select
                  value={selectedSessionTimeoutX}
                  onValueChange={setSelectedSessionTimeoutX}
                  disabled={disableInputs || isDeleteMode}
                >
                  <SelectTrigger variant="glowingSelector">
                    <SelectValue placeholder="Select X (minutes)" />
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

              <div className="mt-4 space-y-3">
                <Label className="text-[16px] leading-6 tracking-[-0.3px] font-semibold">
                  Stop Timeout (Y)
                </Label>

                <p className="text-[13px] leading-5 text-muted-foreground">
                  Stop SensePC after{" "}
                  <span className="font-medium">Y</span> minutes with no active
                  SensePC connection.
                </p>

                <Select
                  value={selectedTimeoutY}
                  onValueChange={setSelectedTimeoutY}
                  disabled={disableInputs}
                >
                  <SelectTrigger variant="glowingSelector">
                    <SelectValue placeholder="Select Y (minutes)" />
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
              {expectedStopRange && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm dark:border-white/15 dark:bg-white/[0.03]">
                  <p className="text-muted-foreground leading-5">
                    Expected stop time range:{" "}
                    <span className="font-medium text-foreground">
                      {expectedStopRange.min}-{expectedStopRange.max} minutes
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {"(Y -> X+Y)"}
                    </span>
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setInfoOpen(true)}
                    aria-label="Explain expected stop time range"
                    disabled={isSaving}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <DialogFooter className="mt-6 flex w-full flex-col-reverse gap-4 sm:flex-row sm:justify-end sm:gap-5">
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  className="w-[170px] rounded-full border-[#a801ba] bg-transparent"
                  disabled={isSaving}
                >
                  Cancel
                </Button>

                <Button
                  disabled={
                    disableInputs ||
                    selectedTimeoutY === "" ||
                    (!isDeleteMode && selectedSessionTimeoutX === "")
                  }
                  onClick={handleSaveIdleSettings}
                  className="flex-1 rounded-full border-0 bg-gradient-to-l from-[#a801ba] to-[#2530f0] text-white hover:opacity-90"
                >
                  {isSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
          {!showForm && (
            <DialogFooter className="mt-6 flex w-full justify-end">
              <Button
                variant="outline"
                onClick={closeDialog}
                className="w-[170px] rounded-full border-[#a801ba] bg-transparent"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </DialogFooter>
          )}

          {showForm && isSaving && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Applying settings... this may take a few seconds.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-[18px] leading-6 tracking-[-0.3px] font-semibold">
              When will my PC stop?
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-5 tracking-[-0.2px]">
              How the expected stop time range is calculated.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-3 text-sm">
            <p className="text-muted-foreground leading-5">
              The stop timer starts only when there is{" "}
              <span className="font-medium text-foreground">
                no active SensePC connection
              </span>
              .
            </p>

            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Y</span> is the
                minimum time before auto-stop (if you disconnect immediately).
              </li>
              <li>
                <span className="font-medium text-foreground">X + Y</span> is
                the typical maximum time (if the connection is disconnected by
                inactivity after X minutes, then we wait Y more minutes).
              </li>
              <li>
                If you manually disconnect or close the tab, the countdown for{" "}
                <span className="font-medium text-foreground">Y</span> starts
                immediately.
              </li>
            </ul>

            {expectedStopRange ? (
              <p className="font-medium text-foreground">
                Your current expected stop time range is{" "}
                {expectedStopRange.min}-{expectedStopRange.max} minutes{" "}
                {"(Y -> X+Y)"}.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Select values for X and Y to see the expected stop time range.
              </p>
            )}
          </div>

          <DialogFooter className="mt-5 flex w-full justify-end">
            <Button
              onClick={() => setInfoOpen(false)}
              className="rounded-full"
              variant="outline"
              disabled={isSaving}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IdleSettingsDialog;
