import type { PC } from "@/app/build-smartpc/types";

import { useState } from "react";
import { isBusy } from "@/app/build-smartpc/utils";
import { useStopVMMutation } from "@/api/fileManagerAPI";
import { removeStartingInstance } from "@/redux/slices/dcv/starting-instances-slice";
import { ConfirmStopModal } from "@/app/build-smartpc/_components/confirm-stop-pc-dialog";

import { Button } from "@/components/ui/button";

import { useDispatch } from "react-redux";

import { StopCircle } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useBoolean } from "@/hooks/use-boolean";

type Props = {
  pc: PC;
  isMember: boolean;
  isPCAssigned: (id: string) => boolean;
};

const SmartPcStopButton = ({ pc, isMember, isPCAssigned }: Props) => {
  const { toast } = useToast();
  const dispatch = useDispatch();

  const showStopDialog = useBoolean();

  const [stoppingInstances, setStoppingInstances] = useState<string[]>([]);
  const [selectedPCForStop, setSelectedPCForStop] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [stopVM, { isLoading }] = useStopVMMutation();

  const isStopping = stoppingInstances.includes(pc.instanceId) || isLoading;

  const handleStop = async () => {
    const instanceId = pc.instanceId;
    setStoppingInstances((prev) => [...prev, instanceId]);
    try {
      await stopVM(instanceId).unwrap();
      toast({
        title: "Computer Stopping",
        description: "The Computer is stopping....",
      });
    } catch (error) {
      console.error("StopVM error:", error);
      let errorMessage =
        "Unable to stop the Computer. Please wait a few moments and try again.";
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        typeof (error as any).data === "string"
      ) {
        errorMessage = (error as any).data;
      }
      toast({
        title: "Failed to Stop Instance",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setStoppingInstances((prev) => prev.filter((id) => id !== instanceId));
      dispatch(removeStartingInstance(instanceId));
      handleDialogClose();
    }
  };

  const handleDialogOpen = () => {
    setSelectedPCForStop({
      id: pc.instanceId,
      name: pc.systemName,
    });
    showStopDialog.onTrue();
  };

  const handleDialogClose = () => {
    setSelectedPCForStop(null);
    showStopDialog.onFalse();
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDialogOpen}
        className="h-8"
        disabled={
          isStopping ||
          isBusy(pc.state) ||
          (!isMember && isPCAssigned(pc.instanceId))
        }
      >
        <StopCircle className="h-4 w-4 mr-1.5" />
        {isStopping ? "Stopping..." : "Stop"}
      </Button>

      {showStopDialog && selectedPCForStop && (
        <ConfirmStopModal
          isOpen={showStopDialog.value}
          onClose={handleDialogClose}
          onConfirm={handleStop}
          desktopName={selectedPCForStop.name}
          isStopping={isStopping}
        />
      )}
    </>
  );
};

export default SmartPcStopButton;
