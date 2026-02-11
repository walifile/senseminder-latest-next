"use client";

import type { RootState } from "@/redux/store";

import React from "react";
import { StripeProvider } from "@/providers/StripeProvider";

import { Button } from "@/components/ui/button";

import { useSelector } from "react-redux";

import { RefreshCw, CreditCard } from "lucide-react";

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
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role;
  const isOwner = role === "owner";
  const isMember = role === "member";
  const isAdmin = role === "admin";
  const isRestricted = isAdmin || isMember;

  return (
    <div data-testid="dashboard-billing-page" className="space-y-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex w-full items-center gap-2 sm:w-auto">
          {isOwner ? (
            <StripeProvider>
              <PaymentMethodDialog />
            </StripeProvider>
          ) : (
            <Button
              disabled
              className="w-full gap-2 font-['Space_Grotesk'] text-sm font-bold sm:w-auto sm:text-base"
              data-testid="billing-add-payment-method-button"
              aria-disabled="true"
            >
              <CreditCard className="h-4 w-4" />
              Manage Payment Methods
            </Button>
          )}
        </div>
      </div>

      <QuickStats blurValues={isMember} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickRecharge
          disableAutoRecharge={isRestricted}
          disableRecharge={isRestricted}
        />
        <PricingPlan />
      </div>
      <BillingHistory
        restricted={isMember}
        restrictedMessage="Not permitted for your role."
      />
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
