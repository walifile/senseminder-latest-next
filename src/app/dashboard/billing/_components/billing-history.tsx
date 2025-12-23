"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";

import { RechargeHistoryTab } from "./recharge-tab";
import { SmartPCUsageHistoryTab } from "./smartpc-usage-history-tab";
import { SmartStorageUsageHistoryTab } from "./smartstorage-usage-history-tab";

const TAB_ICON = {
  recharge: "/assets/dashboard/wallet-2.svg",
  usage: "/assets/dashboard/pc-bill.svg",
  "storage-usage": "/assets/dashboard/cloud-bill.svg",
} as const;

const BillingHistory = () => (
  <DashboardCard
    data-testid="dashboard-billing-history"
    className={cn(
      "relative overflow-hidden p-0",
      "rounded-[20px] backdrop-blur-[32px] backdrop-filter",
      "font-['Space_Grotesk']" // ✅ apply font to entire card
    )}
  >
    <Tabs defaultValue="recharge" className="w-full" variant="glowing">
      {/* Header */}
      <div className="px-6 pt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-[24px] font-bold leading-8 tracking-[-0.4px] text-foreground">
              Wallet Recharge and Billing History:
            </p>
            <p className="text-[16px] leading-6 tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5]">
              View your recharge and usage history
            </p>
          </div>

          {/* Tabs pill (scrollable on small screens) */}
          <div className="overflow-x-auto px-1 py-1">
            <TabsList className="font-['Space_Grotesk']">
              <TabsTrigger value="recharge">
                <img
                  src={TAB_ICON.recharge}
                  alt=""
                  className="h-[18px] w-[18px] shrink-0 filter invert dark:invert-0"
                />
                Wallet Recharge
              </TabsTrigger>

              <TabsTrigger value="usage">
                <img
                  src={TAB_ICON.usage}
                  alt=""
                  className="h-[18px] w-[18px] shrink-0 filter invert dark:invert-0"
                />
                Sense PC Billing
              </TabsTrigger>

              <TabsTrigger value="storage-usage">
                <img
                  src={TAB_ICON["storage-usage"]}
                  alt=""
                  className="h-[18px] w-[18px] shrink-0 filter invert dark:invert-0"
                />
                Sense Cloud Billing
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Header divider */}
        <div className="mt-5 h-px w-full bg-[rgba(37,48,240,0.2)] dark:bg-[rgba(255,255,255,0.2)]" />
      </div>

      {/* Content area (unchanged) */}
      <div className="px-6 pb-6 pt-5">
        <RechargeHistoryTab />
        <SmartPCUsageHistoryTab />
        <SmartStorageUsageHistoryTab />
      </div>
    </Tabs>
  </DashboardCard>
);

export default BillingHistory;
