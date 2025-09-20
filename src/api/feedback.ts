import appConfig from "@/config/app-config";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// import { getIdToken } from "../lib/utils";

const { FEEDBACK_API_URL } = appConfig;

const baseQuery = fetchBaseQuery({
  baseUrl: FEEDBACK_API_URL,
  // prepareHeaders: async (headers) => {
  //   try {
  //     const idToken = await getIdToken();
  //     headers.set("Authorization", idToken);
  //     headers.set("Content-Type", "application/json");
  //   } catch (err) {
  //     console.error("Failed to attach auth headers:", err);
  //   }
  //   return headers;
  // },
});

export const feedbackAPI = createApi({
  reducerPath: "feedbackAPI",
  baseQuery,
  endpoints: (builder) => ({
    submitFeedback: builder.mutation({
      query: (body) => ({
        url: "feedback",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSubmitFeedbackMutation } = feedbackAPI;
