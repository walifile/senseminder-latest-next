"use client";

import React from "react";
import { StripeProvider } from "@/providers/StripeProvider";

import QuickStats from "./_components/quick-stats";
import PricingPlan from "./_components/pricing-plan";
import QuickRecharge from "./_components/quick-recharge";
import BillingHistory from "./_components/billing-history";
import { PaymentMethodDialog } from "./_components/payment-method-dialog";

const BillingPage = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Billing & Payments</h1>
      <StripeProvider>
        <PaymentMethodDialog />
      </StripeProvider>
    </div>

    {/* Quick Stats */}
    <QuickStats />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Recharge Section */}
      <QuickRecharge />

      {/* Plans Section */}
      <PricingPlan />
    </div>

    {/* Billing History Tabs */}
    <BillingHistory />
  </div>
);

export default BillingPage;
