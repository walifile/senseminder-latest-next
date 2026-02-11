import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { FEEDBACK_API_URL, FEEDBACK_TRIGGER_API_URL } = appConfig;

export const feedbackAPI = createApi({
  reducerPath: "feedbackAPI",
  baseQuery: baseQueryWithReauth(true, FEEDBACK_API_URL),
  endpoints: (builder) => ({
    submitFeedback: builder.mutation({
      query: (body) => ({
        url: "feedback",
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    createFeedbackTask: builder.mutation<
      unknown,
      { userId: string; trigger: string; delayMinutes?: number }
    >({
      query: ({ userId, trigger, delayMinutes = 0 }) => ({
        url: `${FEEDBACK_TRIGGER_API_URL}/tasks/create`,
        method: "POST",
        body: { userId, trigger, delayMinutes },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    getNextFeedbackPrompt: builder.mutation<unknown, { userId: string }>({
      query: ({ userId }) => ({
        url: `${FEEDBACK_TRIGGER_API_URL}/prompt/next?userId=${encodeURIComponent(
          userId
        )}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSubmitFeedbackMutation,
  useCreateFeedbackTaskMutation,
  useGetNextFeedbackPromptMutation,
} = feedbackAPI;
