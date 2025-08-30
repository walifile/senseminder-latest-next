import React, { useState } from "react";
import { setLaunchVMResponse } from "@/redux/slices/dcv/dcv-slice";
import { routes } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { useLaunchVMMutation } from "@/api/fileManagerAPI";
import { isBusy } from "@/app/build-smartpc/utils";
import { PC } from "../types";

type Props = {
  pc: PC;
  isMember: boolean;
  userId: string | undefined;
  isPCAssigned: (id: string) => boolean;
};

const SmartPcConnectButton = ({
  pc,
  isMember,
  userId,
  isPCAssigned,
}: Props) => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [launchVM, { isLoading }] = useLaunchVMMutation();

  const [launchingInstances, setLaunchingInstances] = useState<string[]>([]);

  const handleLaunch = async (instanceId: string, pcName: string) => {
    setLaunchingInstances((prev) => [...prev, instanceId]);
    try {
      const response = await launchVM({ instanceId, userId }).unwrap();
      toast({
        title: "Computer Connected",
        description:
          "The Computer has been connected successfully. Redirecting...",
      });
      dispatch(setLaunchVMResponse({ instanceId, response, pcName }));
      const encodedSession = btoa(instanceId);
      window.open(
        `${routes?.pcViewer}?session=${encodedSession}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.log(error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the Computer. Connection aborted.",
        variant: "destructive",
      });
    } finally {
      setLaunchingInstances((prev) => prev.filter((id) => id !== instanceId));
    }
  };

  return (
    <Button
      size="sm"
      variant="default"
      onClick={() => handleLaunch(pc.instanceId, pc.systemName)}
      disabled={
        isLoading ||
        isBusy(pc.state) ||
        pc.state !== "running" ||
        (!isMember && isPCAssigned(pc.instanceId))
      }
      className="h-8"
    >
      <ExternalLink className="h-4 w-4 mr-1.5" />
      {launchingInstances.includes(pc.instanceId) ? "Connecting..." : "Connect"}
    </Button>
  );
};

export default SmartPcConnectButton;
