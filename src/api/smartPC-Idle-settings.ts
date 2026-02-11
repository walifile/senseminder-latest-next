//src/api/smartPC-Idle-settings.ts

"use client";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type {
  IdleSettingsResponse,
  SetIdleSettingsPayload,
} from "@/types/idle-settings";

import appConfig from "@/config/app-config";

import { ensureOkInstanceId } from "@/lib/utils";

import { fetchAuthSession } from "aws-amplify/auth";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const { IDLE_API_URL } = appConfig;

async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

const baseQuery = fetchBaseQuery({
  baseUrl: IDLE_API_URL,
  responseHandler: async (response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { message: text };
    }
  },
});

type IdleSettingsUpdateResponse = {
  message: string;
  instanceId: string;
  timeout: number;
  sessionTimeout: number;
  os?: "windows" | "linux";
  operatingSystem?: string;
  configId?: string;
  ssmStatus?: string;
  commandId?: string;
};

const toCustomError = (error: unknown) => ({
  error: {
    status: "CUSTOM_ERROR",
    data: error instanceof Error ? error.message : "Unknown error",
  } as FetchBaseQueryError,
});

export const smartPCIdleSettingsAPI = createApi({
  reducerPath: "smartPCIdleSettingsAPI",
  baseQuery,
  endpoints: (builder) => ({
    getIdleSettings: builder.query<IdleSettingsResponse, { instanceId: string }>(
      {
        async queryFn({ instanceId }, _api, _extraOptions, baseQuery) {
          let idToken: string;
          try {
            idToken = await getIdToken();
            ensureOkInstanceId(instanceId);
          } catch (error) {
            return toCustomError(error);
          }

          const result = await baseQuery({
            url: "",
            method: "GET",
            params: { instanceId },
            headers: {
              Authorization: idToken,
              "Content-Type": "application/json",
            },
          });

          if (result.error) return { error: result.error };
          return { data: result.data as IdleSettingsResponse };
        },
      }
    ),
    setIdleSettings: builder.mutation<
      IdleSettingsUpdateResponse,
      SetIdleSettingsPayload
    >({
      async queryFn(payload, _api, _extraOptions, baseQuery) {
        let idToken: string;
        try {
          idToken = await getIdToken();
          ensureOkInstanceId(payload.instanceId);

          if (!Number.isInteger(payload.timeout) || payload.timeout < 0) {
            throw new Error("timeout must be an integer >= 0 (minutes).");
          }

          if (
            payload.sessionTimeout !== undefined &&
            (!Number.isInteger(payload.sessionTimeout) ||
              payload.sessionTimeout < 0)
          ) {
            throw new Error("sessionTimeout must be an integer >= 0 (minutes).");
          }
        } catch (error) {
          return toCustomError(error);
        }

        const body = {
          instanceId: payload.instanceId,
          timeout: payload.timeout,
          ...(payload.sessionTimeout !== undefined
            ? { sessionTimeout: payload.sessionTimeout }
            : {}),
        };

        const result = await baseQuery({
          url: "",
          method: "POST",
          body,
          headers: {
            Authorization: idToken,
            "Content-Type": "application/json",
          },
        });

        if (result.error) return { error: result.error };
        return { data: result.data as IdleSettingsUpdateResponse };
      },
    }),
    deleteIdleTimeout: builder.mutation<{ message: string }, { instanceId: string }>({
      async queryFn({ instanceId }, _api, _extraOptions, baseQuery) {
        let idToken: string;
        try {
          idToken = await getIdToken();
          ensureOkInstanceId(instanceId);
        } catch (error) {
          return toCustomError(error);
        }

        const result = await baseQuery({
          url: "",
          method: "DELETE",
          body: { instanceId },
          headers: {
            Authorization: idToken,
            "Content-Type": "application/json",
          },
        });

        if (result.error) return { error: result.error };
        return { data: result.data as { message: string } };
      },
    }),
  }),
});

export const {
  useGetIdleSettingsQuery,
  useSetIdleSettingsMutation,
  useDeleteIdleTimeoutMutation,
} = smartPCIdleSettingsAPI;
