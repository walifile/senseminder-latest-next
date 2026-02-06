"use client";

import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { SECURITY_QUESTION_API } = appConfig;

export const securityQuestionAPI = createApi({
  reducerPath: "securityQuestionAPI",
  baseQuery: baseQueryWithReauth(true, SECURITY_QUESTION_API),
  endpoints: (builder) => ({
    getSecurityQuestion: builder.query<
      { question: string } | null,
      void
    >({
      query: () => ({
        url: "",
        method: "GET",
      }),
    }),
    setSecurityQuestion: builder.mutation<
      { message: string },
      { question: string; answer: string; oldAnswer?: string }
    >({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useLazyGetSecurityQuestionQuery,
  useSetSecurityQuestionMutation,
} = securityQuestionAPI;
