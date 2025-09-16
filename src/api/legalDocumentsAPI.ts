import appConfig from "@/config/app-config";

// src/store/api/legalDocumentsAPI.ts
import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { LEGAL_DOCUMENTS_URL } = appConfig;

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
        url: `${LEGAL_DOCUMENTS_URL}/content`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetLegalDocumentsQuery } = legalDocumentsAPI;
