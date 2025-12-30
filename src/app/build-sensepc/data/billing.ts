// build-smartpc/src/app/build-smartpc/data/billing.ts

export type BillingPlan = "hourly" | "daily" | "monthly";

export type PlanCopy = {
  label: string;
  unit: string;
  tagline: string;
  estimateNote?: string;
  included: string[];
};

export const PLAN_COPY: Record<BillingPlan, PlanCopy> = {
  hourly: {
    label: "Hourly",
    unit: "/hour",
    tagline: "Perfect for quick tasks and testing",
    included: ["Pay only for actual usage", "No minimum commitment", "Support included"],
  },
  daily: {
    label: "Daily",
    unit: "/day",
    tagline: "Best for a full workday session",
    estimateNote: "Estimated based on your current configuration",
    included: ["Includes up to 10 hours/day", "Savings up to 10% vs hourly", "Support included"],
  },
  monthly: {
    label: "Monthly",
    unit: "/month",
    tagline: "Best value for regular users",
    estimateNote: "Estimated based on your current configuration",
    included: ["Includes up to 180 hours/month", "Savings up to 15% vs Hourly", "Support included"],
  },
};

export const PLAN_ORDER: BillingPlan[] = ["hourly", "daily", "monthly"];
