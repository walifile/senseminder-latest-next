import appConfig from "@/config/app-config";

// newsletterAPI.js
import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { NEWSLETTER_API_URL } = appConfig;

export const newsletterAPI = createApi({
  reducerPath: "newsletterAPI",
  baseQuery: baseQueryWithReauth(false),
  tagTypes: ["Newsletter"],
  endpoints: (builder) => ({
    unsubscribeFromNewsletter: builder.mutation({
      query: ({ email, token }) => ({
        url: `${NEWSLETTER_API_URL}/unsubscribe?email=${email}&token=${token}`,
        method: "GET",
      }),
    }),
    subscribeToNewsletter: builder.mutation({
      query: ({ email, location, signup }) => ({
        url: `${NEWSLETTER_API_URL}/subscribe`,
        method: "POST",
        body: {
          email,
          location,
          signup,
        },
      }),
    }),
  }),
});

export const {
  useSubscribeToNewsletterMutation,
  useUnsubscribeFromNewsletterMutation,
} = newsletterAPI;
