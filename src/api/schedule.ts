"use client";

import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { SAVE_VM_SCHEDULE_URL } = appConfig;

export type Schedule = {
  instanceId: string;
  timeZone: string;
  frequency: "everyday" | "weekdays" | "weekends" | "custom";
  startDate?: string;
  endDate?: string;
  autoStartTime?: string;
  autoStopTime?: string;
  enabled?: boolean;
  createdAt?: string;
};

type ScheduleResponse = {
  data?: Schedule;
};

export const scheduleAPI = createApi({
  reducerPath: "scheduleAPI",
  baseQuery: baseQueryWithReauth(true, SAVE_VM_SCHEDULE_URL),
  endpoints: (builder) => ({
    getSchedule: builder.query<ScheduleResponse, { instanceId: string }>({
      query: ({ instanceId }) => ({
        url: `?instanceId=${encodeURIComponent(instanceId)}`,
        method: "GET",
      }),
    }),
    saveSchedule: builder.mutation<ScheduleResponse, Schedule>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    deleteSchedule: builder.mutation<unknown, { instanceId: string }>({
      query: ({ instanceId }) => ({
        url: "",
        method: "DELETE",
        body: { instanceId },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useLazyGetScheduleQuery,
  useSaveScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleAPI;
