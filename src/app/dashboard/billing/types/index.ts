import type { PaymentMethod } from "@stripe/stripe-js";

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
  promoDeduction: string;
  cashbackDeduction: string;
  balanceDeduction: string;
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

// APIs types
export type InstanceBilling = {
  instanceId: string;
  billingPlan: string;
};

export type PaymentMethodResponse = {
  defaultPaymentMethod?: { id: string };
  paymentMethods: Array<{
    id: string;
    card: {
      last4: string;
      exp_month: number;
      exp_year: number;
      brand: string;
    };
  }>;
};

export type BalanceResponse = {
  balance: number;
  lastRecharge?: {
    timestamp: string;
  };
};

export type AutoRechargeResponse = {
  autoRecharge: boolean;
  threshold?: number;
  autoRechargeAmount?: number;
};

export type StoragePricingTierResponse = {
  tier: {
    tier: number;
    pricePerGB: number;
    includedGB: number;
  };
};

export type UsageHistoryResponse = {
  items?: Array<{
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
  }>;
  hasMore?: boolean;
  hasNextPage?: boolean;
  lastEvaluatedKey?: string | Record<string, unknown>;
};

export type RechargeHistoryResponse = {
  history?: Array<{
    txnId: string;
    amount: string;
    date: string;
    status: "completed" | "failed";
    paymentMethod: string;
  }>;
  hasMore?: boolean;
  hasNextPage?: boolean;
  lastEvaluatedKey?: string | Record<string, unknown>;
};
