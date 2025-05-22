import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const fileManagerAPI = createApi({
  reducerPath: "fileManagerAPI",
  baseQuery: baseQueryWithReauth(false),
  tagTypes: ["Files", "VM"],
  endpoints: (builder) => ({
    getEstimate: builder.mutation({
      query: ({ operatingSystem, machineType, storageSize }) => {
        const ssdSizeWithGb = storageSize.endsWith("gb")
          ? storageSize
          : `${storageSize}gb`;

        return {
          url: "https://zxxx3xjbb0.execute-api.us-east-1.amazonaws.com/calculate-cost",
          method: "POST",
          body: {
            operatingSystem,
            instanceSize: machineType,
            region: "n.virginia-usa",
            ssdSize: ssdSizeWithGb,
          },
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
    listRemoteDesktop: builder.query({
      query: ({ userId }) => ({
        url: "https://vj9idlbwf7.execute-api.us-east-1.amazonaws.com/prod/FetchPCdata",
        method: "GET",
        params: {
          userId,
        },
      }),
      providesTags: ["VM"],
    }),
    stopVM: builder.mutation({
      query: (instanceId) => ({
        url: "https://lul5oxdwic.execute-api.us-east-1.amazonaws.com/dev/instance",
        method: "POST",
        body: {
          action: "stop",
          instanceId: instanceId,
          region: "us-east-1",
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["VM"],
    }),

    startVM: builder.mutation({
      query: (instanceId) => ({
        url: "https://lul5oxdwic.execute-api.us-east-1.amazonaws.com/dev/instance",
        method: "POST",
        body: {
          action: "start",
          instanceId: instanceId,
          region: "us-east-1",
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["VM"],
    }),

    launchVM: builder.mutation({
      query: ({ instanceId, userId }) => ({
        url: "https://hxmwrrakc6.execute-api.us-east-1.amazonaws.com/dev/start-session",
        // url: "https://o1jxe42die.execute-api.us-east-1.amazonaws.com/prod/dcv-integration",
        method: "POST",
        body: {
          action: "start-session",
          userId,
          instanceId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["VM"],
    }),

    validateSession: builder.mutation({
      query: ({ instanceId, userId, sessionToken }) => ({
        url: "https://hxmwrrakc6.execute-api.us-east-1.amazonaws.com/dev/validate-session",
        method: "POST",
        body: {
          action: "validate-session",
          userId,
          instanceId,
          sessionToken,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["VM"],
    }),

    stopSession: builder.mutation({
      query: ({ instanceId, userId }) => ({
        url: "https://hxmwrrakc6.execute-api.us-east-1.amazonaws.com/dev/stop-session",
        method: "POST",
        body: {
          action: "stop-session",
          userId,
          instanceId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["VM"],
    }),

    extendSession: builder.mutation({
      query: ({ instanceId, userId, sessionToken }) => ({
        url: "https://hxmwrrakc6.execute-api.us-east-1.amazonaws.com/dev/extend-session",
        method: "POST",
        body: {
          action: "extend-session",
          userId,
          instanceId,
          sessionToken,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["VM"],
    }),

    scheduleVM: builder.mutation({
      query: (scheduleData) => ({
        url: `https://cufbznlyqa.execute-api.us-east-1.amazonaws.com/dev/schedules`,
        method: "POST",
        body: scheduleData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["VM"],
    }),

    // storage part
    starFile: builder.mutation<
      void,
      { region: string; userId: string; fileName: string }
    >({
      query: (payload) => ({
        url: "star",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Files"],
    }),
    unstarFile: builder.mutation<
      void,
      { region: string; userId: string; fileName: string }
    >({
      query: (payload) => ({
        url: "unstar",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Files"],
    }),

    shareFile: builder.mutation({
      query: (body) => ({
        url: "share",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Files"],
    }),
    copyFiles: builder.mutation({
      query: (payload) => ({
        url: "copy",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Files"],
    }),

    moveFiles: builder.mutation({
      query: (body) => ({
        url: "move",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Files"],
    }),
    listFiles: builder.query({
      query: ({ userId, region, type, search, starred, shared, modified }) => ({
        // search = "", token = null,
        url: "list",
        method: "GET",
        params: {
          userId,
          region,
          type,
          ...(search && { search }),
          ...(starred && { starred }),
          ...(shared && { shared }),
          ...(modified && { modified }),
        },
      }),
      providesTags: ["Files"],
    }),
    uploadFile: builder.mutation({
      query: ({
        fileName,
        fileType,
        userId,
        region,
        size,
        status,
        starred,
      }) => ({
        url: "upload",
        method: "POST",
        body: {
          fileName,
          fileType,
          userId,
          region,
          size,
          status,
          starred,
        },
      }),
      invalidatesTags: ["Files"],
    }),
    createFolder: builder.mutation({
      query: ({ region, userId, folderName }) => ({
        url: `create-folder`,
        method: "POST",
        body: {
          region,
          userId,
          folderName,
        },
      }),
      invalidatesTags: ["Files"],
    }),
    uploadToPresignedUrl: builder.mutation({
      query: ({ uploadUrl, file }) => ({
        url: uploadUrl, // Use the presigned S3 URL directly
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      }),
      invalidatesTags: ["Files"],
    }),
    downloadFile: builder.query<
      { downloadUrl: string },
      { fileName: string; userId: string; region: string }
    >({
      query: ({ fileName, userId, region }) => ({
        url: "/download",
        params: { fileName, userId, region },
      }),
    }),

    deleteFile: builder.mutation<
      { message: string },
      { fileName: string; userId: string; region: string }
    >({
      query: ({ fileName, userId, region }) => ({
        url: `/delete`,
        method: "DELETE",
        params: { fileName, userId, region },
      }),
      invalidatesTags: ["Files"],
    }),

    deleteFiles: builder.mutation<
      { message: string },
      { region: string; userId: string; fileNames: string[] }
    >({
      query: ({ region, userId, fileNames }) => ({
        url: "/delete-multiple",
        method: "POST",
        body: {
          region,
          userId,
          fileNames,
        },
      }),
      invalidatesTags: ["Files"],
    }),
  }),
});

export const {
  useScheduleVMMutation,
  useStopVMMutation,
  // useDeleteVMMutation,
  useStartVMMutation,
  useLaunchVMMutation,
  useListFilesQuery,
  useListRemoteDesktopQuery,
  useUploadFileMutation,
  useUploadToPresignedUrlMutation,
  useLazyDownloadFileQuery,
  useDeleteFileMutation,
  useDeleteFilesMutation,
  useGetEstimateMutation,
  useCreateFolderMutation,
  useStarFileMutation,
  useUnstarFileMutation,
  useShareFileMutation,
  useCopyFilesMutation,
  useMoveFilesMutation,
} = fileManagerAPI;
