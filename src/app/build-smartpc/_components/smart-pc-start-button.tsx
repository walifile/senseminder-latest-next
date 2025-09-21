import type { PC } from "@/app/build-smartpc/types";

import { isBusy } from "@/app/build-smartpc/utils";
import { useStartVMMutation } from "@/api/fileManagerAPI";
import { addStartingInstance } from "@/redux/slices/dcv/starting-instances-slice";

import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useDispatch } from "react-redux";

import { Play } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

type Props = {
  pc: PC;
  isMember: boolean;
  isStarting: boolean;
  isPCAssigned: (id: string) => boolean;
};

const SmartPcStartButton = ({
  pc,
  isMember,
  isStarting,
  isPCAssigned,
}: Props) => {
  const { toast } = useToast();
  const dispatch = useDispatch();

  const [startVM, { isLoading }] = useStartVMMutation();

  const handleStart = async (instanceId: string) => {
    dispatch(addStartingInstance(instanceId));
    try {
      await startVM(instanceId).unwrap();
      toast({
        title: "Computer Starting",
        description: "The Computer is starting .....",
      });
    } catch (error) {
      console.error("StartVM error:", error);
      toast({
        title: "Failed to Start Computer",
        description: getErrorMessage(
          error,
          "Unable to start the Computer. Please wait a few moments and try again."
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleStart(pc.instanceId)}
      className="h-8"
      disabled={
        isLoading ||
        isStarting ||
        isBusy(pc.state) ||
        (!isMember && isPCAssigned(pc.instanceId))
      }
    >
      <Play className="h-4 w-4 mr-1.5" />
      {isStarting ? "Starting..." : "Start"}
    </Button>
  );
};

export default SmartPcStartButton;
