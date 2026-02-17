import type { RootState } from "@/redux/store";

import {
  Circle,
  Loader2,
  PowerOff,
  StopCircle,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

import { getIdTokenSafe } from "@/lib/auth/token";

import type { PC } from "../types";

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

export const formatUptimeHours = (hours: number): string => {
  const totalMinutes = Math.floor(hours * 60);

  if (totalMinutes < 60) {
    // Less than 1 hour - show only minutes
    return `${totalMinutes}m`;
  }

  const hoursPart = Math.floor(totalMinutes / 60);
  const minutesPart = totalMinutes % 60;

  if (minutesPart === 0) {
    return `${hoursPart}h`;
  }

  return `${hoursPart}h ${minutesPart}m`;
};

export const getStatusClasses = (state: PC["status"], isStarting: boolean) => {
  if (isStarting) return "bg-yellow-500/10 text-yellow-500";

  switch (state) {
    case "running":
      return "bg-green-500/10 text-green-500";
    case "stopped":
      return "bg-red-500/10 text-red-500";
    case "initializing":
    case "initialization":
    case "pending":
      return "bg-yellow-500/10 text-yellow-500";
    case "stopping":
      return "bg-orange-500/10 text-orange-500";
    case "idle":
      return "bg-blue-500/10 text-blue-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
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

export function extractStorageGiB(pc: {
  storageGiB?: number;
  storage?: number;
  storageSize?: number;
  volumeSize?: number;
  rootVolumeSize?: number;
  diskSize?: number;
  ssdSize?: number;
}): number | undefined {
  const candidates = [
    pc.storageGiB,
    pc.storage,
    pc.storageSize,
    pc.volumeSize,
    pc.rootVolumeSize,
    pc.diskSize,
    pc.ssdSize,
  ];
  const val = candidates.find((v) => typeof v === "number" && v > 0);
  return typeof val === "number" ? val : undefined;
}

export function getApiUserId(u: RootState["auth"]["user"]) {
  if (!u) return "";
  if (u.role === "member" || u.role === "admin") return u.ownerid;
  return u.id;
}

export function formatIdleTime(mins: number): string {
  if (isNaN(mins)) return "—";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}h ${minutes}m`;
}

export const formatScheduleTime = (pcInfo?: {
  schedule?: { autoStartTime?: string; autoStopTime?: string };
}) => {
  const start = pcInfo?.schedule?.autoStartTime;
  const stop = pcInfo?.schedule?.autoStopTime;

  if (start && stop) return `${start} – ${stop}`;
  if (start) return `Starts at ${start}`;
  if (stop) return `Stops at ${stop}`;
  return null;
};

export const makeResizeRequest = async (url: string, payload: object) => {
  const idToken = await getIdTokenSafe();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const validateStorageIncrease = (
  currentStorage: string,
  newStorage: string
) => {
  const prev = parseInt(currentStorage, 10);
  const next = parseInt(newStorage, 10);

  if (isNaN(next)) {
    return {
      valid: false,
      error: "Invalid size",
      description: "Please choose a valid storage size.",
    };
  }

  if (next <= prev) {
    return {
      valid: false,
      error: next < prev ? "Storage cannot be decreased" : "No change detected",
      description: "Choose a larger storage size to apply the increase.",
    };
  }

  return { valid: true };
};

export function clampPercent(value: number | null | undefined): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, n));
}


export function fmtMoney(n?: number, digits: number = 2) {
  if (n == null) return "-";
  return `$${n.toFixed(digits)}`;
}

export function normalizeGB(storageSize?: string | null) {
  const raw = (storageSize ?? "").trim();
  const n = parseFloat(raw.replace(/\s*gb/i, ""));
  return Number.isFinite(n) ? String(n) : "";
}


export function formatCycleDateUTC(iso?: string | null) {
  if (!iso) return null;
  const hasTz =
    /[zZ]$/.test(iso) || /[+-]\d{2}:\d{2}$/.test(iso) || /[+-]\d{4}$/.test(iso);

  const safeIso = hasTz ? iso : `${iso}Z`;

  const d = new Date(safeIso);
  if (Number.isNaN(d.getTime())) return null;

  const formatted = d.toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formatted} UTC`;
}



export const isFiniteNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

export const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  const scaled = Math.abs(value) * factor;
  const rounded = Math.round(scaled + Number.EPSILON);
  return Math.sign(value) * (rounded / factor);
};

export const formatUsd = (value: number, decimals: number) => {
  const rounded = roundTo(value, decimals);
  const normalized = Object.is(rounded, -0) ? 0 : rounded;
  return `$${normalized.toFixed(decimals)}`;
};
