import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils"; // Ensure it handles authentication if needed

export const vmManagementAPI = createApi({
  reducerPath: "vmManagementAPI",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Estimate"],
  endpoints: (builder) => ({
    createVM: builder.mutation({
      query: ({ configId, amiId, systemName, region, storageSize }) => ({
        url: "https://lul5oxdwic.execute-api.us-east-1.amazonaws.com/dev/instance",
        method: "POST",
        body: {
          action: "create",
          configId,
          amiId,
          systemName,
          region,
          storageSize,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    deleteVM: builder.mutation({
      query: ({ instanceId, region }) => ({
        url: "https://lul5oxdwic.execute-api.us-east-1.amazonaws.com/dev/instance",
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

// ✅ Export hooks here, outside the API definition
export const { useCreateVMMutation, useDeleteVMMutation } = vmManagementAPI;
