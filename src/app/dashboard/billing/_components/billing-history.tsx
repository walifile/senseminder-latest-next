"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { RechargeHistoryTab } from "./recharge-tab";
import { SmartPCUsageHistoryTab } from "./smartpc-usage-history-tab";
import { SmartStorageUsageHistoryTab } from "./smartstorage-usage-history-tab";

const BillingHistory = () => (
  <Card>
    <CardHeader>
      <CardTitle>Wallet Recharge and Billing History:</CardTitle>
      <CardDescription>View your recharge and usage history</CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="recharge" className="space-y-4">
        {/* Wrap TabsList in a scrollable container */}
        <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
          <TabsList className="flex w-fit min-w-full gap-2">
            {[
              { value: "recharge", label: "Wallet Recharge" },
              { value: "usage", label: "Sense PC Billing" },
              { value: "storage-usage", label: "Sense Cloud Billing" },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <RechargeHistoryTab />
        <SmartPCUsageHistoryTab />
        <SmartStorageUsageHistoryTab />
      </Tabs>
    </CardContent>
  </Card>
);

export default BillingHistory;
