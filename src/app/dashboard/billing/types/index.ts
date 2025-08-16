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
