"use client";

import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { MFA_API_URL } = appConfig;

export const mfaRecoveryAPI = createApi({
  reducerPath: "mfaRecoveryAPI",
  baseQuery: baseQueryWithReauth(false, MFA_API_URL),
  endpoints: (builder) => ({
    checkMfaStatus: builder.query<
      { action?: string; provider?: string; message?: string },
      { email: string }
    >({
      query: ({ email }) => ({
        url: "",
        method: "GET",
        params: {
          check: "1",
          email,
        },
      }),
    }),
    sendRecoveryEmail: builder.mutation<unknown, { email: string }>({
      query: ({ email }) => ({
        url: "",
        method: "POST",
        body: { email },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    sendTotpRecovery: builder.mutation<unknown, { email: string }>({
      query: ({ email }) => ({
        url: "",
        method: "POST",
        body: {
          email,
          action: "disable-totp",
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useLazyCheckMfaStatusQuery,
  useSendRecoveryEmailMutation,
  useSendTotpRecoveryMutation,
} = mfaRecoveryAPI;
