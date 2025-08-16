"use client";

import React, { useState } from "react";
import { PaymentMethodDialog } from "./_components/payment-method-dialog";
import { StripeProvider } from "@/components/ui/StripeProvider";
import QuickRecharge from "./_components/quick-recharge";
import PricingPlan from "./_components/pricing-plan";
import QuickStats from "./_components/quick-stats";
import BillingHistory from "./_components/billing-history";

const BillingPage = () => {
  const [balance, setBalance] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing & Payments</h1>
        <StripeProvider>
          <PaymentMethodDialog />
        </StripeProvider>
      </div>

      {/* Quick Stats */}
      <QuickStats balance={balance} setBalance={setBalance} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Recharge Section */}
        <QuickRecharge setBalance={setBalance} />

        {/* Plans Section */}
        <PricingPlan />
      </div>

      {/* Billing History Tabs */}
      <BillingHistory />
    </div>
  );
};

export default BillingPage;
