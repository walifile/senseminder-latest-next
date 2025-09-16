import appConfig from "@/config/app-config";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getIdToken } from "../lib/utils";

const { USER_MANAGEMENT_API } = appConfig;

const baseQuery = fetchBaseQuery({
  baseUrl: USER_MANAGEMENT_API,
  prepareHeaders: async (headers) => {
    try {
      const idToken = await getIdToken();
      headers.set("Authorization", idToken);
      headers.set("Content-Type", "application/json");
    } catch (err) {
      console.error("Failed to attach auth headers:", err);
    }
    return headers;
  },
});

export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<any, void>({
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
  useDeleteUserMutation,
} = userAPI;
