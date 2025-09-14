// newsletterAPI.js
import { createApi } from "@reduxjs/toolkit/query/react";

import api from "./apiConfig";
import { baseQueryWithReauth } from "./apiUtils";

const BASE_URL = api.NEWSLETTER_API_URL;

export const newsletterAPI = createApi({
  reducerPath: "newsletterAPI",
  baseQuery: baseQueryWithReauth(false),
  tagTypes: ["Newsletter"],
  endpoints: (builder) => ({
    unsubscribeFromNewsletter: builder.mutation({
      query: ({ email, token }) => ({
        url: `${BASE_URL}/unsubscribe?email=${email}&token=${token}`,
        method: "GET",
      }),
    }),
    subscribeToNewsletter: builder.mutation({
      query: ({ email, location, signup }) => ({
        url: `${BASE_URL}/subscribe`,
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
