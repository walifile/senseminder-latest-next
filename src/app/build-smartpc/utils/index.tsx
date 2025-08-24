import { PC } from "../types";

import {
  StopCircle,
  Circle,
  PlayCircle,
  PauseCircle,
  Loader2,
  PowerOff,
} from "lucide-react";
import { removeStartingInstance } from "@/redux/slices/dcv/starting-instances-slice";
import { AppDispatch } from "@/redux/store";

export const isBuilding = (state: string) =>
  ["initializing", "initialization", "pending"].includes(state);

export const isBusy = (state: string) =>
  isBuilding(state) || state === "stopping";

export const getDaysFromFrequency = (frequency: string): string[] => {
  switch (frequency) {
    case "everyday":
      return [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
    case "weekdays":
      return ["monday", "tuesday", "wednesday", "thursday", "friday"];
    case "weekends":
      return ["saturday", "sunday"];
    default:
      return [];
  }
};

export const formatUptime = (seconds: number): string => {
  if (seconds === 0) return "Not running";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const getStatusText = (
  status: PC["status"],
  isStarting = false
): string => {
  if (isStarting) return "Starting";

  switch (status) {
    case "pending":
    case "initializing":
    case "initialization":
    case "building":
      return "Building";
    case "running":
      return "Running";
    case "stopped":
      return "Stopped";
    case "starting":
      return "Starting";
    case "stopping":
      return "Stopping";
    case "idle":
      return "Idle";
    case "not_running":
      return "Not Running";
    default:
      return status;
  }
};

export const getStatusIcon = (status: PC["status"]) => {
  switch (status) {
    case "building":
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case "initializing":
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case "initialization":
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case "pending":
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case "running":
      return <PlayCircle className="h-4 w-4" />;
    case "stopped":
      return <PowerOff className="h-4 w-4" />;
    case "starting":
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case "stopping":
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case "idle":
      return <PauseCircle className="h-4 w-4" />;
    case "not_running":
      return <StopCircle className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
};

export const isStartingInstance = (
  instanceId: string,
  state: string,
  startingInstances: string[]
): boolean => {
  const validStates = ["initialization", "pending", "initializing"];
  const isInList = startingInstances.includes(instanceId);
  const isValidState = validStates.includes(state);

  return isInList && isValidState;
};

export function inferLinuxCategoryFromConfigId(
  configId = ""
):
  | "Ubuntu_24.04_LTS_X64"
  | "Ubuntu_24.04_LTS_ARM"
  | "Ubuntu_22.04_LTS_X64"
  | "Ubuntu_22.04_LTS_ARM"
  | undefined {
  const id = configId.toLowerCase();
  if (id.includes("24.04") && id.includes("x64")) return "Ubuntu_24.04_LTS_X64";
  if (id.includes("24.04") && id.includes("arm")) return "Ubuntu_24.04_LTS_ARM";
  if (id.includes("22.04") && id.includes("x64")) return "Ubuntu_22.04_LTS_X64";
  if (id.includes("22.04") && id.includes("arm")) return "Ubuntu_22.04_LTS_ARM";
  return undefined;
}
