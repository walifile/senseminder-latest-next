// src/store/api/legalDocumentsAPI.ts
import { createApi } from "@reduxjs/toolkit/query/react";

import api from "./apiConfig";
import { baseQueryWithReauth } from "./apiUtils";

const BASE_URL = api.LEGAL_DOCUMENTS_URL;

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
