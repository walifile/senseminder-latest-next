/* eslint perfectionist/sort-imports: "off" */
import appConfig from "@/config/app-config";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

const { FIRST_TIME_TOKEN_URL } = appConfig;

export const firstTimeSetupAPI = createApi({
  reducerPath: "firstTimeSetupAPI",
  baseQuery: baseQueryWithReauth(true, FIRST_TIME_TOKEN_URL),
  endpoints: (builder) => ({
    checkFirstLogin: builder.query<{ firstLogin: boolean; federatedUser: boolean }, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
    }),
    completeFirstLogin: builder.mutation<
      { message: string },
      { name: string; organization?: string }
    >({
      query: (body) => ({
        url: "",
        method: "PATCH",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useCheckFirstLoginQuery,
  useCompleteFirstLoginMutation,
} = firstTimeSetupAPI;
