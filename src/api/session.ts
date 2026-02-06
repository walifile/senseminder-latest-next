"use client";

import appConfig from "@/config/app-config";

import { Logger } from "@/lib/utils/logger";

import { UAParser } from "ua-parser-js";
import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

export interface SmartPCSession {
  sessionId: string;
  deviceName?: string;
  ip?: string;
  lastSeen: string;
  occupied?: boolean;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  isCurrentSession?: boolean;
  locationDisplay?: string;
}

const { IPIFY_URL, CLIENT_SESSION_API } = appConfig;

const ipifyBaseQuery = baseQueryWithReauth(false, IPIFY_URL);

const getIpAddress = async (api: Parameters<typeof ipifyBaseQuery>[1]) => {
  try {
    const result = await ipifyBaseQuery({ url: "", method: "GET" }, api, {});
    const data = result.data as { ip?: string } | undefined;
    return data?.ip || "unknown";
  } catch {
    return "unknown";
  }
};

export const sessionAPI = createApi({
  reducerPath: "sessionAPI",
  baseQuery: baseQueryWithReauth(true, CLIENT_SESSION_API),
  endpoints: (builder) => ({
    updateSessionHeartbeat: builder.mutation<void, void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        try {
          const sessionId = localStorage.getItem("smartpc-session-id");
          if (!sessionId) {
            Logger.warn("No sessionId in localStorage. Skipping heartbeat.");
            return { data: undefined };
          }

          const ip = await getIpAddress(api);
          const parser = new UAParser();
          const result = parser.getResult();
          const deviceName = `${result.browser.name} on ${result.os.name}`;

          const response = await baseQuery(
            {
              url: "",
              method: "POST",
              body: {
                mode: "heartbeat",
                sessionId,
                ip,
                deviceName,
              },
              headers: {
                "Content-Type": "application/json",
              },
            },
            api,
            _extraOptions
          );

          if (response.error) {
            Logger.warn("Failed to update heartbeat:", response.error);
            return { error: response.error };
          }

          const parsed = response.data as { message?: string; code?: string } | null;

          if (parsed?.code === "SESSION_NOT_ACTIVE") {
            Logger.log(
              "Heartbeat skipped: session is not active or not claimed yet.",
              parsed
            );
            return { data: undefined };
          }

          Logger.log("Heartbeat updated for session:", sessionId);
          return { data: undefined };
        } catch (err) {
          Logger.error("Heartbeat error:", err);
          return {
            error: {
              status: "CUSTOM_ERROR",
              data: err instanceof Error ? err.message : "Unknown error",
            },
          };
        }
      },
    }),
    claimSessionIfAvailable: builder.mutation<void, void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        try {
          const prevSessionId = localStorage.getItem("smartpc-session-id");

          const ip = await getIpAddress(api);
          const parser = new UAParser();
          const result = parser.getResult();
          const deviceName = `${result.browser.name} on ${result.os.name}`;

          const response = await baseQuery(
            {
              url: "",
              method: "POST",
              body: {
                mode: "claim",
                ip,
                deviceName,
              },
              headers: {
                "Content-Type": "application/json",
              },
            },
            api,
            _extraOptions
          );

          if (response.error) {
            Logger.warn("No unclaimed session available:", response.error);
            return { data: undefined };
          }

          const data = response.data as { sessionId?: string; message?: string };

          if (data?.sessionId) {
            const newSessionId = data.sessionId;

            if (prevSessionId && prevSessionId !== newSessionId) {
              Logger.log("⚠️ Replacing old session ID:", prevSessionId);
            }

            localStorage.setItem("smartpc-session-id", newSessionId);
            Logger.log("Session claimed:", newSessionId);
          } else {
            Logger.warn("No unclaimed session available:", data?.message || data);
          }

          return { data: undefined };
        } catch (err) {
          Logger.error("Failed to claim session:", err);
          return {
            error: {
              status: "CUSTOM_ERROR",
              data: err instanceof Error ? err.message : "Unknown error",
            },
          };
        }
      },
    }),
    fetchActiveSessions: builder.query<SmartPCSession[], void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        try {
          const response = await baseQuery(
            {
              url: "",
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
            api,
            _extraOptions
          );

          if (response.error) {
            Logger.error("Failed to fetch sessions:", response.error);
            return { data: [] };
          }

          const raw = (response.data as SmartPCSession[]) ?? [];
          const currentId = localStorage.getItem("smartpc-session-id");

          const normalized = raw.map((s) => {
            const location = s.location || {};
            const locationDisplay =
              location.city || location.region || location.country
                ? `${location.city || "?"}, ${location.country || location.region || "?"}`
                : "Unknown";

            return {
              sessionId: s.sessionId,
              deviceName: s.deviceName || "Unknown Device",
              ip: s.ip || "N/A",
              lastSeen: new Date(s.lastSeen).toLocaleString(),
              location,
              locationDisplay,
              occupied: s.occupied,
              isCurrentSession: s.sessionId === currentId,
            };
          });

          return { data: normalized };
        } catch (err) {
          Logger.error("Failed to fetch sessions:", err);
          return { data: [] };
        }
      },
    }),
  }),
});

export const {
  useUpdateSessionHeartbeatMutation,
  useClaimSessionIfAvailableMutation,
  useLazyFetchActiveSessionsQuery,
} = sessionAPI;
