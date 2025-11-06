import appConfig from "@/config/app-config";
import { Logger } from "@/lib/utils/logger";

export interface ScheduleInfo {
  enabled: boolean;
  autoStartTime?: string;
  autoStopTime?: string;
  frequency?: "everyday" | "weekdays" | "weekends" | "custom";
  startDate?: string | null;
  endDate?: string | null;
  timeZone?: string;
}

export interface InstanceSpecs {
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  os: string;
}

export interface InstanceDetail {
  systemName: string;
  instanceId?: string;
  configId?: string;
  schedule?: ScheduleInfo;
  region?: string;
  uptime?: string;
  idleTimeout?: number;
  cpuUsage?: string;
  memoryUsage?: string;
  specs?: InstanceSpecs;
  error?: string;
}
const { INSTANCE_DETAILS_URL } = appConfig;

export async function fetchInstanceDetails(
  userId: string,
  instanceNames: string[]
): Promise<InstanceDetail[]> {
  try {
    const res = await fetch(INSTANCE_DETAILS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        instanceNames,
      }),
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    return data as InstanceDetail[];
  } catch (err) {
    Logger.error("Failed to load real-time metrics:", err);
    return [];
  }
}
