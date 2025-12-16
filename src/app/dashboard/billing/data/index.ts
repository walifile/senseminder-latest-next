import { Clock, Calendar, CalendarDays } from "lucide-react";

export const quickRechargeAmounts = [
  {
    amount: 20,
    label: "",
  },
  { amount: 50, label: "", description: "", isRecommended: true },
  {
    amount: 100,
    label: "",
    description: "",
  },
  { amount: 200, label: "", description: "" },
];

export const billingPlans = [
  {
    id: "hourly",
    name: "Hourly",
    description: "Perfect for quick tasks and testing",
    icon: Clock,
    features: [
      "Pay only for actual usage",
      "No minimum commitment",
      "Support included",
    ],
  },
  {
    id: "daily",
    name: "Daily",
    description: "Ideal for day-long projects",
    price: "9.99",
    unit: "day",
    icon: CalendarDays,
    features: [
      "24-hour continuous access",
      "15% savings vs hourly",
      "Support included",
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    description: "Best value for regular users",
    price: "179.99",
    unit: "month",
    icon: Calendar,
    features: [
      "30-day continuous access",
      "35% savings vs weekly",
      "Support included",
    ],
  },
];

export const promotionsAndCashback = [
  {
    label: "Promotion",
    tooltip:
      "Promotional balance is a limited-time credit added to your account (e.g., from offers or referrals). It can only be used for service usage and holds no real-world cash value.",
    color: "text-sky-600",
    value: 0,
    align: "items-start text-start",
  },
  {
    label: "Cashback",
    tooltip:
      "Cashback balance is earned from qualifying activity and is only valid toward service usage. It is not withdrawable or redeemable as real money.",
    color: "text-indigo-600",
    value: 0,
    align: "items-end text-end",
  },
];

export const smartStoragePlans = [
  {
    id: "hourly",
    name: "Hourly",
    icon: Clock,
    price: "0.15",
    unit: "GB/hour",
    description: "Flexible storage for temporary needs",
    features: [
      "High-speed SSD storage",
      "Pay per GB used",
      "Instant provisioning",
      "Data redundancy",
      "No minimum commitment",
    ],
  },
  {
    id: "daily",
    name: "Daily",
    icon: Calendar,
    price: "2.50",
    unit: "GB/day",
    description: "Optimized for daily workflows",
    features: [
      "All hourly features",
      "30% cost savings vs hourly",
      "Batch processing optimization",
      "Enhanced performance",
      "Daily usage analytics",
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    icon: CalendarDays,
    price: "50.00",
    unit: "GB/month",
    description: "Cost-effective for persistent storage",
    features: [
      "All daily features",
      "40% cost savings vs daily",
      "Enterprise-grade reliability",
      "Advanced backup options",
      "Volume discounts available",
    ],
  },
];
