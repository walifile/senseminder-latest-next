/* eslint perfectionist/sort-imports: "off" */

import { createApi } from "@reduxjs/toolkit/query/react";
import appConfig from "@/config/app-config";

// Reuse existing baseQuery with optional auth disabled for this public endpoint
import { baseQueryWithReauth } from "./apiUtils";

type CpuOption = { value: string; label: string };

export type SmartPcConfigResponse = {
  // Example shape:
  // {
  //   Linux: {
  //     Ubuntu_24.04_LTS_X64: [{ value, label }, ...]
  //   },
  //   Windows: { ... }
  // }
  cpuCategories?: Record<string, Record<string, CpuOption[]>>;
  cpuOptions?: Record<string, CpuOption[]>;
};

export type GetSmartPcConfigArgs = {
  region?: string;
};

export const smartPCConfigAPI = createApi({
  reducerPath: "smartPCConfigAPI",
  baseQuery: baseQueryWithReauth(false),
  endpoints: (builder) => ({
    getSmartPcConfig: builder.query<SmartPcConfigResponse, GetSmartPcConfigArgs>({
      query: (args) => ({
        // Use base env and append path
        url: `${appConfig.SMART_PC_CONFIG_URL}/config`,
        method: "GET",
        params: args?.region ? { region: args.region } : undefined,
      }),
    }),
  }),
});

export const { useGetSmartPcConfigQuery } = smartPCConfigAPI;
