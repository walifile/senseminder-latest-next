// src/store/api/legalDocumentsAPI.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

const BASE_URL = process.env.NEXT_PUBLIC_LEGAL_DOCUMENTS_URL!;

if (!BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_LEGAL_DOCUMENTS_URL in .env file");
}

export const legalDocumentsAPI = createApi({
  reducerPath: "legalDocumentsAPI",
  baseQuery: baseQueryWithReauth(false),
  endpoints: (builder) => ({
    getLegalDocuments: builder.query<
      {
        termsContent: string;
        privacyContent: string;
      },
      void
    >({
      query: () => ({
        url: `${BASE_URL}/content`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetLegalDocumentsQuery } = legalDocumentsAPI;
