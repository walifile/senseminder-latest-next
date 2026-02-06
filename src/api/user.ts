import type { ApiUser } from "@/app/dashboard/users/types";

import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { USER_MANAGEMENT_API } = appConfig;

interface GetUsersResponse {
  users: ApiUser[];
}

export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: baseQueryWithReauth(true, USER_MANAGEMENT_API),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResponse, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    inviteUser: builder.mutation({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (body) => ({
        url: "",
        method: "DELETE",
        body,
        headers: {
          "Content-Type": "application/json",
        },
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
