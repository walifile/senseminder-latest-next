import appConfig from "@/config/app-config";

// newsletterAPI.js
import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { NEWSLETTER_API_URL } = appConfig;

export const newsletterAPI = createApi({
  reducerPath: "newsletterAPI",
  baseQuery: baseQueryWithReauth(false, NEWSLETTER_API_URL),
  tagTypes: ["Newsletter"],
  endpoints: (builder) => ({
    unsubscribeFromNewsletter: builder.mutation({
      query: ({ email, token }) => ({
        url: "unsubscribe",
        method: "GET",
        params: { email, token },
      }),
    }),
    subscribeToNewsletter: builder.mutation({
      query: ({ email, location, signup }) => ({
        url: "subscribe",
        method: "POST",
        body: {
          email,
          location,
          signup,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useSubscribeToNewsletterMutation,
  useUnsubscribeFromNewsletterMutation,
} = newsletterAPI;
