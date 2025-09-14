import { createApi } from "@reduxjs/toolkit/query/react";

import api from "./apiConfig";
import { baseQueryWithReauth } from "./apiUtils";

const BASE_URL = api.CONTACT_URL;

export const contactAPI = createApi({
  reducerPath: "contactAPI",
  baseQuery: baseQueryWithReauth(false),
  tagTypes: ["Contact"],
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: ({ name, email, subject, message }) => ({
        url: `${BASE_URL}/contact`,
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
