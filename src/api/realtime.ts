import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

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

export interface UptimeInfo {
  maxUptimeHours: string;
  currentUptimeHours: string;
  billingPlan: string;
}

export interface InstanceDetail {
  systemName: string;
  instanceId?: string;
  configId?: string;
  schedule?: ScheduleInfo;
  region?: string;
  uptime?: string;
  uptimeInfo?: UptimeInfo;
  idleTimeout?: number;
  cpuUsage?: string;
  memoryUsage?: string;
  specs?: InstanceSpecs;
  error?: string;
}
const { INSTANCE_DETAILS_URL } = appConfig;

export const realtimeAPI = createApi({
  reducerPath: "realtimeAPI",
  baseQuery: baseQueryWithReauth(true, INSTANCE_DETAILS_URL),
  endpoints: (builder) => ({
    fetchInstanceDetails: builder.mutation<
      InstanceDetail[],
      { userId: string; instanceNames: string[] }
    >({
      query: ({ userId, instanceNames }) => ({
        url: "",
        method: "POST",
        body: { userId, instanceNames },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useFetchInstanceDetailsMutation } = realtimeAPI;
