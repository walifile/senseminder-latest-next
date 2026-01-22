"use client";

import type { PC } from "@/app/build-sensepc/types";

import { useState } from "react";
import { isBusy } from "@/app/build-sensepc/utils";
import { useRestartVMMutation } from "@/api/fileManagerAPI";
import { addStartingInstance } from "@/redux/slices/dcv/starting-instances-slice";

import { Logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useDispatch } from "react-redux";

import { RotateCcw } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { ConfirmRebootModal } from "./confirm-reboot-modal";

type Props = {
  pc: PC;
  isMember: boolean;
  isStarting: boolean;
  isPCAssigned: (id: string) => boolean;
};

const SmartPcRebootButton = ({
  pc,
  isMember,
  isStarting,
  isPCAssigned,
}: Props) => {
  const { toast } = useToast();
  const dispatch = useDispatch();

  const [restartVM, { isLoading: isRebooting }] = useRestartVMMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isRunning = pc.state?.toLowerCase() === "running";

  const handleReboot = async () => {
    // Only reboot if truly running & not busy
    if (!isRunning || isBusy(pc.state)) return;

    dispatch(addStartingInstance(pc.instanceId));
    try {
      await restartVM(pc.instanceId).unwrap();
      toast({
        title: "Computer Rebooting",
        description:
          "Your PC will reboot and disconnect all remote sessions. Please reconnect in about 1–2 minutes from dashboard.",
      });
    } catch (error) {
      Logger.error("RestartVM error:", error);
      toast({
        title: "Failed to Reboot Computer",
        description: getErrorMessage(
          error,
          "Unable to reboot the computer. Please wait a few moments and try again."
        ),
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  const disabled =
    !isRunning ||
    isRebooting ||
    isStarting ||
    isBusy(pc.state) ||
    (!isMember && isPCAssigned(pc.instanceId));

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsDialogOpen(true);
        }}
      >
        <RotateCcw className="h-4 w-4 mr-1.5" />
        {isStarting || isRebooting ? "Rebooting..." : "Reboot"}
      </Button>

      <ConfirmRebootModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleReboot}
        desktopName={pc.systemName || "this"}
        isRebooting={isRebooting}
      />
    </>
  );
};

export default SmartPcRebootButton;
