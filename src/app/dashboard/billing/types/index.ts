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

export type RechargeEventType =
  | "RECHARGE_WALLET"
  | "REFUND_PROCESSED"
  | "CASHBACK_ADDED"
  | "PROMO_BALANCE_ADDED";

export interface Recharge {
  userId: string;
  eventTimestamp: string;
  eventType: RechargeEventType;
  amount: string;
  details: {
    // RECHARGE_WALLET
    paymentIntentId?: string;
    paymentMethodId?: string;
    paymentMethodDisplay?: string;
    // REFUND_PROCESSED
    reason?: string;
    amountProcessed?: string;
    refundId?: string;
    processedBy?: string;
    processedByName?: string;
    chargeId?: string | null;
    idempotencyKey?: string;
    providerResponse?: {
      ok: boolean;
      error: string | null;
    };
    // CASHBACK_ADDED
    basis?: string;
    cashback_earned?: string;
    billing_start_date?: string;
    billing_end_date?: string;
    job_id?: string;
    posted_at?: string;
    // PROMO_BALANCE_ADDED
    campaign?: string;
    // Common
    amount?: string;
    user_id?: string;
  };
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
  history?: Recharge[];
  hasMore?: boolean;
  hasNextPage?: boolean;
  lastEvaluatedKey?: string | Record<string, unknown>;
};
