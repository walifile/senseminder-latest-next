"use client";

import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { ASSIGN_API_URL } = appConfig;

export const assignPcAPI = createApi({
  reducerPath: "assignPcAPI",
  baseQuery: baseQueryWithReauth(true, ASSIGN_API_URL),
  endpoints: (builder) => ({
    assignPC: builder.mutation<
      unknown,
      { memberId: string; instanceId: string; systemName: string }
    >({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    unassignPC: builder.mutation<
      unknown,
      { memberId: string; instanceId: string }
    >({
      query: (body) => ({
        url: "",
        method: "DELETE",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    getAssignments: builder.query<Record<string, { instanceId: string }[]>, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useAssignPCMutation,
  useUnassignPCMutation,
  useLazyGetAssignmentsQuery,
} = assignPcAPI;
