import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

if (!process.env.NEXT_PUBLIC_CONTACT_URL) {
  throw new Error("Missing NEXT_PUBLIC_BASE_URL in env");
}
const BASE_URL = process.env.NEXT_PUBLIC_CONTACT_URL;

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
