import type { ApiUser } from "@/app/dashboard/users/types";

import appConfig from "@/config/app-config";

import { Logger } from "@/lib/utils/logger";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getIdToken } from "../lib/utils";

const { USER_MANAGEMENT_API } = appConfig;

interface GetUsersResponse {
  users: ApiUser[];
}

const baseQuery = fetchBaseQuery({
  baseUrl: USER_MANAGEMENT_API,
  prepareHeaders: async (headers) => {
    try {
      const idToken = await getIdToken();
      headers.set("Authorization", idToken);
      headers.set("Content-Type", "application/json");
    } catch (err) {
      Logger.error("Failed to attach auth headers:", err);
    }
    return headers;
  },
});

export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResponse, void>({
      query: () => "",
      providesTags: ["Users"],
    }),

    inviteUser: builder.mutation({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    resendInvite: builder.mutation({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
    }),

    deleteUser: builder.mutation({
      query: (body) => ({
        url: "",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useInviteUserMutation,
  useResendInviteMutation,
  useDeleteUserMutation,
} = userAPI;
