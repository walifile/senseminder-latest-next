import type {
  SearchHistoryParams,
  MonthlyChangeSummary,
} from "@/app/dashboard/billing/types";

import appConfig from "@/config/app-config";

import { formatAsYYYYMMDD } from "@/lib/utils/format-time";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getIdToken } from "../lib/utils";

type InstanceBilling = {
  instanceId: string;
  billingPlan: string;
};

const { BILLING_API_URL } = appConfig;

const baseQuery = fetchBaseQuery({
  baseUrl: BILLING_API_URL,
  prepareHeaders: async (headers) => {
    try {
      const idToken = await getIdToken();
      headers.set("Authorization", idToken);
      headers.set("Content-Type", "application/json");
    } catch (err) {
      console.error("Failed to attach auth headers:", err);
    }
    return headers;
  },
});

export const billingAPI = createApi({
  reducerPath: "billingAPI",
  baseQuery,
  tagTypes: [
    "PaymentMethods",
    "Balance",
    "BillingPlan",
    "UsageHistory",
    "AutoRecharge",
    "Storage",
  ],
  endpoints: (builder) => ({
    // payment methods
    getPaymentMethods: builder.query<any, void>({
      query: () => "payment-methods",
      providesTags: ["PaymentMethods"],
    }),
    addPaymentMethod: builder.mutation({
      query: (body) => ({
        url: "payment-methods",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
    setDefaultPaymentMethod: builder.mutation({
      query: (body) => ({
        url: "set-default-card",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
    detachPaymentMethod: builder.mutation({
      query: (body) => ({
        url: "payment-methods/detach",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentMethods"],
    }),

    // balance
    getCurrentBalance: builder.query<any, void>({
      query: () => "balance",
      providesTags: ["Balance"],
    }),

    // auto-recharge
    getAutoRecharge: builder.query<any, void>({
      query: () => "auto-recharge",
      providesTags: ["AutoRecharge"],
    }),
    updateAutoRecharge: builder.mutation({
      query: (body) => ({
        url: "auto-recharge",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AutoRecharge"],
    }),

    // storage pricing
    getStoragePricingTier: builder.query<any, void>({
      query: () => "storage/tier-pricing",
      providesTags: ["Storage"],
    }),
    // monthly spending
    getMonthlySpending: builder.query<MonthlyChangeSummary, void>({
      query: () => "monthly-spending",
      providesTags: ["Balance"],
    }),

    // recharge
    recharge: builder.mutation({
      query: (body) => ({
        url: "recharge",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Balance", "UsageHistory"],
    }),

    // billing
    addBillingPlan: builder.mutation({
      query: (body: InstanceBilling) => ({
        url: "billing-plan",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BillingPlan"],
    }),

    // usage history
    searchUsageHistory: builder.query<any, SearchHistoryParams>({
      query: ({
        from,
        to,
        limit = 5,
        startingAfter,
        isStorageHistory = false,
      }) => {
        const queryParams = new URLSearchParams();
        if (from) queryParams.append("startDate", formatAsYYYYMMDD(from));
        if (to) queryParams.append("endDate", formatAsYYYYMMDD(to));
        if (limit) queryParams.append("pageSize", limit.toString());
        if (startingAfter)
          queryParams.append("lastEvaluatedKey", startingAfter);

        const storageUrl = isStorageHistory ? "/storage" : "";
        return `usage-history${storageUrl}?${queryParams.toString()}`;
      },
      providesTags: ["UsageHistory"],
    }),

    // recharge history
    searchRechargeHistory: builder.query<
      any,
      Omit<SearchHistoryParams, "isStorageHistory">
    >({
      query: ({ from, to, limit = 5, startingAfter }) => {
        const queryParams = new URLSearchParams();
        if (from) queryParams.append("startDate", formatAsYYYYMMDD(from));
        if (to) queryParams.append("endDate", formatAsYYYYMMDD(to));
        if (limit) queryParams.append("pageSize", limit.toString());
        if (startingAfter) queryParams.append("startingAfter", startingAfter);

        return `recharge?${queryParams.toString()}`;
      },
      providesTags: ["UsageHistory"],
    }),
  }),
});

export const {
  // payment methods
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useDetachPaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,

  // balance
  useGetCurrentBalanceQuery,
  useGetMonthlySpendingQuery,
  useRechargeMutation,

  // billing
  useAddBillingPlanMutation,

  // history
  useLazySearchUsageHistoryQuery,
  useLazySearchRechargeHistoryQuery,

  // auto-recharge
  useGetAutoRechargeQuery,
  useUpdateAutoRechargeMutation,

  // storage
  useGetStoragePricingTierQuery,
} = billingAPI;
