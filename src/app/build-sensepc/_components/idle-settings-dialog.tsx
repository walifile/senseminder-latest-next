
import type { InstanceDetail } from "@/api/realtime";

import React, { useState, useEffect, useCallback } from "react";
// --- IDLE TIMEOUT API ---
import { setIdleTimeout, deleteIdleTimeout } from "@/api/smartPC-Idle-settings";

import { Logger } from "@/lib/utils/logger";
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

import { useToast } from "@/hooks/use-toast";

import { timeOptions } from "../data";

import type { DesktopInstance } from "../types";

type IdleSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  realtimePcInfo: Record<string, InstanceDetail>;
  selectedInstance: DesktopInstance | null;
  onSuccess: () => void;
};

const IdleSettingsDialog: React.FC<IdleSettingsDialogProps> = ({
  open,
  onClose,
  realtimePcInfo,
  selectedInstance,
  onSuccess,
}) => {
  const { toast } = useToast();

  const [selectedIdleTimeout, setSelectedIdleTimeout] = useState<string>("30");

  const handleSaveIdleSettings = async () => {
    if (!selectedInstance) return;
    const noneValues = ["", "none", "0"];
    const trimmed = String(selectedIdleTimeout).trim().toLowerCase();

    try {
      if (noneValues.includes(trimmed)) {
        await deleteIdleTimeout(selectedInstance.instanceId);
        toast({
          title: "Idle Timeout Removed",
          description: `Idle timeout was cleared for ${selectedInstance.systemName}`,
        });
      } else {
        await setIdleTimeout(
          selectedInstance.instanceId,
          Number(selectedIdleTimeout),
        );
        toast({
          title: "Idle Timeout Saved",
          description: `Timeout set to ${selectedIdleTimeout} minutes for ${selectedInstance.systemName}`,
        });
      }
      onSuccess();
      closeDialog();
    } catch (e) {
      Logger.error("Failed to save idle timeout:", e);
      toast({
        title: "Idle Timeout Change Failed",
        description: "Could not update idle timeout",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (selectedInstance) {
      const selectedPc = realtimePcInfo[selectedInstance.systemName];
      setSelectedIdleTimeout(
        selectedPc?.idleTimeout ? String(selectedPc.idleTimeout) : "30",
      );
    }
  }, [realtimePcInfo, selectedInstance]);

  const closeDialog = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      {/* position / outer card is the same as before */}
      <DialogContent className="sm:max-w-[500px]">
        {/* HEADER */}
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-[24px] leading-8 tracking-[-0.4px] font-semibold">
            Configure Idle Settings
          </DialogTitle>

          <DialogDescription className="text-[14px] leading-5 tracking-[-0.2px]">
            Set the idle timeout duration for {selectedInstance?.systemName}.
            The PC will be suspended after being idle for the specified
            duration.
          </DialogDescription>
        </DialogHeader>

        {/* thin divider like Vector 80 in Figma */}
        <div className="mt-2 h-px w-full bg-black/10 dark:bg-white/15" />

        {/* FIELD BLOCK */}
        <div className="mt-4 space-y-3">
          <Label className="text-[16px] leading-6 tracking-[-0.3px] font-semibold">
            Idle Timeout (minutes)
          </Label>

          <Select
           
            value={selectedIdleTimeout}
            onValueChange={setSelectedIdleTimeout}
          >
           <SelectTrigger variant="glowingSelector">
            <SelectValue placeholder="Select timeout duration" />
          </SelectTrigger>

            <SelectContent>
              {timeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* BUTTONS ROW */}
        <DialogFooter className="mt-6 flex w-full flex-col-reverse gap-4 sm:flex-row sm:justify-end sm:gap-5">
          {/* Cancel button: outlined pill with purple border */}
          <Button
            variant="outline"
            onClick={closeDialog}
            className="
              w-[170px]
              rounded-full
              border-[#a801ba]
              bg-transparent
            "
          >
            Cancel
          </Button>

          {/* Save Changes: gradient pill, flex-grow */}
          <Button
            disabled={!selectedInstance}
            onClick={handleSaveIdleSettings}
            className="
              flex-1
              rounded-full
              border-0
              bg-gradient-to-l from-[#a801ba] to-[#2530f0]
              text-white
              hover:opacity-90
            "
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IdleSettingsDialog;
