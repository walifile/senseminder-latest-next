"use client";

import React from "react";
import { StripeProvider } from "@/providers/StripeProvider";

import { Button } from "@/components/ui/button";

import { RefreshCw } from "lucide-react";

import QuickStats from "./_components/quick-stats";
import PricingPlan from "./_components/pricing-plan";
import QuickRecharge from "./_components/quick-recharge";
import BillingHistory from "./_components/billing-history";
import { PaymentMethodDialog } from "./_components/payment-method-dialog";
import {
  useBillingRefresh,
  BillingRefreshProvider,
} from "./_context/billing-refresh-context";

function BillingPageInner() {
  const { triggerRefresh } = useBillingRefresh();

  return (
      <div data-testid="dashboard-billing-page" className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8">
              Billing & Payments
            </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={triggerRefresh}
            aria-label="Refresh billing data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <StripeProvider>
            <PaymentMethodDialog />
          </StripeProvider>
        </div>
      </div>

      <QuickStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickRecharge />
        <PricingPlan />
      </div>
      <BillingHistory />
    </div>
  );
}

export default function BillingPage() {
  return (
    <BillingRefreshProvider>
      <BillingPageInner />
    </BillingRefreshProvider>
  );
}
