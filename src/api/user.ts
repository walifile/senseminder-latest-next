import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import api from "./apiConfig";
import { getIdToken } from "../lib/utils";

const USER_API_URL = api.USER_MANAGEMENT_API;

const baseQuery = fetchBaseQuery({
  baseUrl: USER_API_URL,
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
