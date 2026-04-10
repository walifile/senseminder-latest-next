"use client";

import type { RootState } from "@/redux/store";

import { routes } from "@/constants/routes";
import React, { useMemo, useState } from "react";
import { isBusy } from "@/app/build-sensepc/utils";
import { useLaunchVMMutation, useValidateSessionMutation } from "@/api/fileManagerAPI";
import { validateSessionWithPolling } from "@/app/pc-viewer/_components/sensepc-session";
import { setLaunchVMResponse, selectLaunchVMResponse } from "@/redux/slices/dcv/dcv-slice";

import { Logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";

import { useDispatch, useSelector } from "react-redux";

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
  const [validateSession] = useValidateSessionMutation();
  const [launchingInstances, setLaunchingInstances] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const defaultSessionKey = useMemo(
    () => pc.systemName?.trim() || pc.instanceId,
    [pc.instanceId, pc.systemName]
  );
  const existingSession = useSelector((state: RootState) =>
    defaultSessionKey ? selectLaunchVMResponse(state, defaultSessionKey) : null
  );

  const handleLaunch = async (instanceId: string, pcName: string) => {
    setLaunchingInstances((prev) => [...prev, instanceId]);
    setShowPopup(true); 

    try {
      const sessionKey = pcName?.trim() || instanceId;
      if (
        existingSession &&
        existingSession.sessionId &&
        existingSession.sessionToken &&
        existingSession.dnsName &&
        existingSession.instanceId === instanceId &&
        userId
      ) {
        const validation = await validateSessionWithPolling(
          (args) => validateSession(args).unwrap(),
          {
            instanceId,
            userId,
            sessionToken: existingSession.sessionToken,
          },
          { maxAttempts: 2, delayMs: 1500 }
        );

        if (validation.status === "active" || validation.status === "creating") {
          dispatch(
            setLaunchVMResponse({ sessionKey, response: existingSession, pcName, instanceId, userId })
          );
          const pcParam = encodeURIComponent(sessionKey);
          window.open(
            `${routes?.pcViewer}?pc=${pcParam}`,
            "_blank",
            "noopener,noreferrer"
          );
          toast({
            title: "Computer Connected",
            description:
              "The Computer has been connected successfully. Redirecting...",
          });
          return;
        }
      }

      const response = await launchVM({ instanceId, userId }).unwrap();
      dispatch(setLaunchVMResponse({ sessionKey, response, pcName, instanceId, userId }));
      const pcParam = encodeURIComponent(sessionKey);
      window.open(
        `${routes?.pcViewer}?pc=${pcParam}`,
        "_blank",
        "noopener,noreferrer"
      );

      toast({
        title: "Computer Connected",
        description:
          "The Computer has been connected successfully. Redirecting...",
      });
    } catch (error) {
      Logger.error(error);
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
      {/* <Button
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
      </Button> */}
<Button
  size="sm"
  variant="default"
  onClick={(e) => {
    e.stopPropagation();
    void handleLaunch(pc.instanceId, pc.systemName);
  }}
  disabled={
    isLoading ||
    isBusy(pc.state) ||
    pc.state !== "running" ||
    (!isMember && isPCAssigned(pc.instanceId))
  }
  className="h-8"
  data-testid="sensepc-connect-button"
>
  <ExternalLink className="mr-1.5 h-4 w-4" />
  {launchingInstances.includes(pc.instanceId) ? "Connecting..." : "Connect"}
</Button>

      <SlidePopup open={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
};

export default SmartPcConnectButton;
