"use client";

import React, { useState } from "react";
import { routes } from "@/constants/routes";
import { isBusy } from "@/app/build-smartpc/utils";
import { useLaunchVMMutation } from "@/api/fileManagerAPI";
import { setLaunchVMResponse } from "@/redux/slices/dcv/dcv-slice";

import { Button } from "@/components/ui/button";

import { useDispatch } from "react-redux";

import { ExternalLink } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import SlidePopup from "./slide-pop-up"; 

import type { PC } from "../types";

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
  const [showPopup, setShowPopup] = useState(false);

  const handleLaunch = async (instanceId: string, pcName: string) => {
    setLaunchingInstances((prev) => [...prev, instanceId]);
    setShowPopup(true); 

    try {
      const response = await launchVM({ instanceId, userId }).unwrap();
      dispatch(setLaunchVMResponse({ instanceId, response, pcName }));
      const encodedSession = btoa(instanceId);
      window.open(
        `${routes?.pcViewer}?session=${encodedSession}`,
        "_blank",
        "noopener,noreferrer"
      );

      toast({
        title: "Computer Connected",
        description:
          "The Computer has been connected successfully. Redirecting...",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the Computer. Connection aborted.",
        variant: "destructive",
      });
      setShowPopup(false);
    } finally {
      setLaunchingInstances((prev) => prev.filter((id) => id !== instanceId));
    }
  };

  return (
    <>
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
      <SlidePopup open={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
};

export default SmartPcConnectButton;
