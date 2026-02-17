//src/api/smartPC-Idle-settings.ts

"use client";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type {
  IdleSettingsResponse,
  SetIdleSettingsPayload,
} from "@/types/idle-settings";

import appConfig from "@/config/app-config";

import { ensureOkInstanceId } from "@/lib/utils";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { IDLE_API_URL } = appConfig;

const responseHandler = async (response: Response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
};

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
  baseQuery: baseQueryWithReauth(true, IDLE_API_URL),
  endpoints: (builder) => ({
    getIdleSettings: builder.query<IdleSettingsResponse, { instanceId: string }>(
      {
        async queryFn({ instanceId }, _api, _extraOptions, baseQuery) {
          try {
            ensureOkInstanceId(instanceId);
          } catch (error) {
            return toCustomError(error);
          }

          const result = await baseQuery({
            url: "",
            method: "GET",
            params: { instanceId },
            responseHandler,
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
        try {
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
            "Content-Type": "application/json",
          },
          responseHandler,
        });

        if (result.error) return { error: result.error };
        return { data: result.data as IdleSettingsUpdateResponse };
      },
    }),
    deleteIdleTimeout: builder.mutation<{ message: string }, { instanceId: string }>({
      async queryFn({ instanceId }, _api, _extraOptions, baseQuery) {
        try {
          ensureOkInstanceId(instanceId);
        } catch (error) {
          return toCustomError(error);
        }

        const result = await baseQuery({
          url: "",
          method: "DELETE",
          body: { instanceId },
          headers: {
            "Content-Type": "application/json",
          },
          responseHandler,
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
