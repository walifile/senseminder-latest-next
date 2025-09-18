"use client";

import type { ReactNode } from "react";

import appConfig from "@/config/app-config";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const { STRIPE_PK } = appConfig;

const stripePromise = loadStripe(STRIPE_PK);

export function StripeProvider({ children }: { children: ReactNode }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
