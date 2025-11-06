/* eslint perfectionist/sort-imports: "off" */
import appConfig from "@/config/app-config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Logger } from "@/lib/utils/logger";

const { FIRST_TIME_TOKEN_URL } = appConfig;

const baseQuery = fetchBaseQuery({
  baseUrl: FIRST_TIME_TOKEN_URL,
  prepareHeaders: async (headers) => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      if (!idToken) throw new Error("User is not authenticated.");
      headers.set("Authorization", idToken);
      headers.set("Content-Type", "application/json");
    } catch (err) {
      Logger.error("Failed to attach auth headers:", err);
    }
    return headers;
  },
});

export const firstTimeSetupAPI = createApi({
  reducerPath: "firstTimeSetupAPI",
  baseQuery,
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
      }),
    }),
  }),
});

export const {
  useCheckFirstLoginQuery,
  useCompleteFirstLoginMutation,
} = firstTimeSetupAPI;
