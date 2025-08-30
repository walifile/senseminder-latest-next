import { PaymentMethod } from "@stripe/stripe-js";

export type ExtendedPaymentMethod = PaymentMethod & {
  isDefault?: boolean;
};

export type MonthlyChangeSummary = {
  currentMonth: number;
  lastMonth: number;
  percentChange: number;
  trend: "increase" | "decrease" | "no change";
};

export interface UsageHistory {
  instanceId: string;
  timestamp: string;
  billingAmount: string;
  billingPlan: string;
  startTime: string;
  endTime: string;
  instanceMinutes: string;
  storageMinutes: string;
  storageBillingStartTime: string;
  storageBillingEndTime: string;
  systemName: string;
  status: string;
  instanceCost: string;
  storageCost: string;
}

export interface Recharge {
  txnId: string;
  amount: string;
  date: string;
  status: "completed" | "failed";
  paymentMethod: string;
}

export interface UsageHistory {
  timestamp: string;
  billingAmount: string;
  billingPlan: string;
  startTime: string;
  endTime: string;
  cashback: string;
  maxStorage: string;
  netStorage: string;
}

export type SearchHistoryParams = {
  from?: Date | null; // ISO date string
  to?: Date | null; // ISO date string
  limit?: number;
  startingAfter?: string | null;
  isStorageHistory?: boolean | null;
};
