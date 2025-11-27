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
          Number(selectedIdleTimeout)
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
        selectedPc?.idleTimeout ? String(selectedPc.idleTimeout) : "30"
      );
    }
  }, [realtimePcInfo, selectedInstance]);

  const closeDialog = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Configure Idle Settings</DialogTitle>
          <DialogDescription>
            Set the idle timeout duration for {selectedInstance?.systemName}.
            The PC will be suspended after being idle for the specified
            duration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Idle Timeout (minutes)</Label>
          <Select
            value={selectedIdleTimeout}
            onValueChange={setSelectedIdleTimeout}
          >
            <SelectTrigger>
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
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button disabled={!selectedInstance} onClick={handleSaveIdleSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IdleSettingsDialog;
