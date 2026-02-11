"use client";

import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { PROMO_API_URL } = appConfig;

export const promoCashbackAPI = createApi({
  reducerPath: "promoCashbackAPI",
  baseQuery: baseQueryWithReauth(true, PROMO_API_URL),
  endpoints: (builder) => ({
    getPromoInfo: builder.query<
      { eligible?: boolean; reason?: string; message?: string },
      void
    >({
      query: () => ({
        url: "",
        method: "GET",
      }),
    }),
    redeemPromo: builder.mutation<
      { message?: string; amountAdded?: number; promoId?: string },
      void
    >({
      query: () => ({
        url: "",
        method: "POST",
        body: {},
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useGetPromoInfoQuery,
  useLazyGetPromoInfoQuery,
  useRedeemPromoMutation,
} = promoCashbackAPI;
