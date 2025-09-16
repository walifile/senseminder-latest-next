import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils"; // Ensure it handles authentication if needed

const { VM_MANAGEMENT_URL } = appConfig;

export const vmManagementAPI = createApi({
  reducerPath: "vmManagementAPI",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Estimate"],
  endpoints: (builder) => ({
    createVM: builder.mutation({
      query: ({
        configId,
        amiId,
        systemName,
        region,
        storageSize,
        billingPlan,
      }) => ({
        url: VM_MANAGEMENT_URL,
        method: "POST",
        body: {
          action: "create",
          configId,
          amiId,
          systemName,
          region,
          storageSize,
          billingPlan,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    deleteVM: builder.mutation({
      query: ({ instanceId, region }) => ({
        url: VM_MANAGEMENT_URL,
        method: "POST",
        body: {
          action: "delete",
          instanceId,
          region,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useCreateVMMutation, useDeleteVMMutation } = vmManagementAPI;
