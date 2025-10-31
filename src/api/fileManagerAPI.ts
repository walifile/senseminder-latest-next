import appConfig from "@/config/app-config";

import { fetchAuthSession } from "aws-amplify/auth";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const {
  ESTIMATION_URL,
  FETCH_PC_URL,
  VM_MANAGEMENT_URL,
  VM_SESSION_URL,
  VM_VALIDATE_SESSION_URL,
  VM_STOP_SESSION_URL,
  VM_EXTEND_SESSION_URL,
  VM_SCHEDULES_URL,
} = appConfig;

export const fileManagerAPI = createApi({
  reducerPath: "fileManagerAPI",
  baseQuery: baseQueryWithReauth(false),
  tagTypes: ["Files", "VM", "Hierarchy"],
  endpoints: (builder) => ({
    getEstimate: builder.mutation({
      query: ({ configId, storageSize, region }) => ({
        url: ESTIMATION_URL,
        method: "POST",
        body: {
          configId,
          storageSize: parseInt(storageSize),
          region,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    listRemoteDesktop: builder.query({
      query: ({ userId }) => ({
        url: FETCH_PC_URL,
        method: "GET",
        params: {
          userId,
        },
      }),
      providesTags: ["VM"],
    }),
    // stopVM: builder.mutation({
    //   query: (instanceId) => ({
    //     url: "https://lul5oxdwic.execute-api.us-east-1.amazonaws.com/dev/instance",
    //     method: "POST",
    //     body: {
    //       action: "stop",
    //       instanceId: instanceId,
    //       region: "us-east-1",
    //     },
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   }),
    //   invalidatesTags: ["VM"],
    // }),
    stopVM: builder.mutation({
      async queryFn(instanceId: string) {
        try {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
          if (!token) throw new Error("No ID token found");

          const response = await fetch(VM_MANAGEMENT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              action: "stop",
              instanceId,
              region: "us-east-1",
            }),
          });

          const text = await response.text();
          let data;

          try {
            data = JSON.parse(text);
          } catch {
            data = { message: text };
          }

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data:
                  data?.message ||
                  "Something went wrong while stopping the PC.",
              },
            };
          }

          return { data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
      invalidatesTags: ["VM"],
    }),

    // startVM: builder.mutation({
    //   query: (instanceId) => ({
    //     url: "https://lul5oxdwic.execute-api.us-east-1.amazonaws.com/dev/instance",
    //     method: "POST",
    //     body: {
    //       action: "start",
    //       instanceId: instanceId,
    //       region: "us-east-1",
    //     },
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   }),
    //   invalidatesTags: ["VM"],
    // }),
    // startVM: builder.mutation({
    //   async queryFn(instanceId: string) {
    //     try {
    //       const session = await fetchAuthSession();
    //       const token = session.tokens?.idToken?.toString();
    //       if (!token) throw new Error("No ID token found");

    //       const response = await fetch("https://lul5oxdwic.execute-api.us-east-1.amazonaws.com/dev/instance", {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: token,
    //         },
    //         body: JSON.stringify({
    //           action: "start",
    //           instanceId,
    //           region: "us-east-1",
    //         }),
    //       });

    //       const data = await response.json();

    //       if (!response.ok) {
    //         return { error: { status: response.status, data } };
    //       }

    //       return { data };
    //     } catch (error) {
    //       return {
    //         error: {
    //           status: 500,
    //           data: error instanceof Error ? error.message : "Unknown error",
    //         },
    //       };
    //     }
    //   },
    //   invalidatesTags: ["VM"],
    // }),
    startVM: builder.mutation({
      async queryFn(instanceId: string) {
        try {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
          if (!token) throw new Error("No ID token found");

          const response = await fetch(VM_MANAGEMENT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              action: "start",
              instanceId,
              region: "us-east-1",
            }),
          });

          const text = await response.text();
          let data;

          try {
            data = JSON.parse(text);
          } catch {
            data = { message: text };
          }

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data:
                  data?.message ||
                  "Something went wrong while starting the PC.",
              },
            };
          }

          return { data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
      invalidatesTags: ["VM"],
    }),

    launchVM: builder.mutation({
      query: ({ instanceId, userId }) => ({
        url: VM_SESSION_URL,
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
        url: VM_VALIDATE_SESSION_URL,
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
        url: VM_STOP_SESSION_URL,
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
        url: VM_EXTEND_SESSION_URL,
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
        url: VM_SCHEDULES_URL,
        method: "POST",
        body: scheduleData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["VM"],
    }),

    listHierarchy: builder.query({
      query: ({ userId, region }) => ({
        url: "list-hierarchy",
        method: "GET",
        params: {
          userId,
          region,
        },
      }),
      providesTags: ["Hierarchy"],
    }),

    // storage part
    starFile: builder.mutation({
      query: (payload) => ({
        url: "star",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Files"],
    }),
    unstarFile: builder.mutation({
      query: (payload) => ({
        url: "unstar",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Files"],
    }),

    shareFiles: builder.mutation({
      query: (body) => ({
        url: "share-multiple",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Files"],
    }),
    cancelShare: builder.mutation<{ message: string }, { shareId: string }>({
      query: ({ shareId }) => ({
        url: `shares/${shareId}/cancel`,
        method: "POST",
      }),
    }),
    publicSharedList: builder.query({
      query: ({ region, key }) => ({
        url: "public-shared-list",
        method: "GET",
        params: {
          region,
          key,
        },
      }),
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
      query: (body) => ({
        url: "copy",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Files"],
    }),

    moveFiles: builder.mutation({
      query: (body) => ({
        url: "move",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Files", "Hierarchy"],
    }),
    listFiles: builder.query({
      query: ({
        userId,
        region,
        type,
        search,
        starred,
        shared,
        modified,
        folder,
        sortBy,
        limit,
        page,
      }) => ({
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
          ...(folder && { folder }),
          ...(sortBy && { sortBy }),
          limit,
          page,
          // recursive,
        },
      }),
      providesTags: ["Files"],
    }),
    getUsage: builder.query({
      query: ({ userId }) => ({
        url: "usage",
        method: "GET",
        params: { userId },
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
        folder,
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
          folder,
        },
      }),
      invalidatesTags: ["Files"],
    }),
    downloadFolder: builder.query<
      { downloadUrl: string },
      {
        region: string;
        key?: string; // for public/shared
        userId?: string; // for private
        folder?: string; // for private
      }
    >({
      query: ({ region, key, userId, folder }) => {
        const params: Record<string, string> = {
          region,
        };

        if (key && key.trim() !== "") {
          params.key = key;
        }

        if (userId && userId.trim() !== "") {
          params.userId = userId;
        }

        if (folder && folder.trim() !== "") {
          params.folder = folder;
        }

        return {
          url: "download-folder",
          method: "GET",
          params,
        };
      },
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
      invalidatesTags: ["Files", "Hierarchy"],
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
      {
        fileName: string;
        userId: string;
        region: string;
        folder?: string;
        key?: string;
      }
    >({
      query: ({ fileName, userId, region, folder, key }) => ({
        url: "/download",
        method: "GET",
        params: {
          fileName,
          userId,
          region,
          ...(folder && { folder }),
          ...(key && { key }),
        },
      }),
    }),

    deleteFile: builder.mutation<
      { message: string },
      {
        fileName: string;
        userId: string;
        region: string;
        folder?: string;
        key?: string;
      }
    >({
      query: ({ fileName, userId, region, folder, key }) => ({
        url: `/delete`,
        method: "DELETE",
        params: {
          fileName,
          userId,
          region,
          ...(folder && { folder }),
          ...(key && { key }),
        },
      }),
      invalidatesTags: ["Files"],
    }),

    deleteFiles: builder.mutation<
      { message: string },
      {
        region: string;
        userId: string;
        fileNames: (string | { folder: string; fileName: string })[];
      }
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
  useShareFilesMutation,
  useCancelShareMutation,
  useCopyFilesMutation,
  useMoveFilesMutation,
  useGetUsageQuery,
  useListHierarchyQuery,
  useLazyDownloadFolderQuery,
  usePublicSharedListQuery,
} = fileManagerAPI;
