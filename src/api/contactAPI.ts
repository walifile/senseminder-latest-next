import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { CONTACT_URL } = appConfig;

export const contactAPI = createApi({
  reducerPath: "contactAPI",
  baseQuery: baseQueryWithReauth(false),
  tagTypes: ["Contact"],
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: ({ name, email, subject, message }) => ({
        url: `${CONTACT_URL}/contact`,
        method: "POST",
        body: {
          name,
          email,
          subject,
          message,
        },
      }),
    }),
  }),
});

export const { useSendContactMessageMutation } = contactAPI;
