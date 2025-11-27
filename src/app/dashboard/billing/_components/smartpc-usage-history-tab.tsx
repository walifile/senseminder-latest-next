import { useState } from "react";
import { useLazySearchUsageHistoryQuery } from "@/api/billing";

import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { fCurrency } from "@/lib/utils/format-number";
import { formatDateTime } from "@/lib/utils/format-time";

import { Monitor } from "lucide-react";

import { getUsagePeriod } from "../utils";
import HistoryFilters from "./history-filters";
import { useHistoryData } from "../hooks/use-history-data";
import HistoryLoadMoreButton from "./history-load-more-button";

import type { UsageHistory } from "../types";

export function SmartPCUsageHistoryTab() {
  const [query, setQuery] = useState("");

  const filterFunction = (item: UsageHistory, searchQuery: string) =>
    item.systemName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;

  const { filteredHistory, date, setDate, loading, hasMore, fetchHistory } =
    useHistoryData<UsageHistory>({
      lazyQueryHook: useLazySearchUsageHistoryQuery,
      filterFunction,
      query,
    });

  const handleRefresh = async () => {
    await fetchHistory(false);
  };

  return (
    <TabsContent value="usage" className="space-y-4">
      {/* Filters */}
      <HistoryFilters
        date={date}
        setDate={setDate}
        query={query}
        setQuery={setQuery}
        onRefresh={handleRefresh}
        isRefreshing={loading}
      />

      {/* History List */}
      <div className="rounded-lg border max-h-[400px] overflow-y-auto divide-y">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">
            Loading usage history...
          </p>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((usage) => (
            <div
              key={usage.timestamp}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Monitor className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{usage.systemName}</p>
                    <Badge variant="outline" className="text-xs">
                      {usage.billingPlan}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getUsagePeriod(usage)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Billed: {formatDateTime(usage.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5 text-xs text-muted-foreground text-right">
                {/* 💻 Billing Cost Summary */}
                <div className="leading-tight">
                  🖥 CPU + Mem: {fCurrency(usage.instanceCost)} <br />
                  💾 SSD: {fCurrency(usage.storageCost)}
                </div>

                {/* 💸 Deduction Breakdown */}
                <div className="leading-tight border-l pl-4 space-y-0.5 text-left">
                  <p className="font-medium text-muted-foreground">💸 Breakdown</p>
                  <p>• Promo: {fCurrency(usage.promoDeduction ?? 0)}</p>
                  <p>• Cashback: {fCurrency(usage.cashbackDeduction ?? 0)}</p>
                  <p>• Wallet: {fCurrency(usage.balanceDeduction ?? 0)}</p>
                </div>

                {/* 💰 Amount Badge */}
                <div className="flex flex-col items-center justify-center gap-2 ml-2">
                  <Badge variant="secondary" className="font-medium px-3 py-1 text-sm">
                    {fCurrency(usage.billingAmount)}
                  </Badge>

                  <Badge
                    variant={usage.status === "running" ? "default" : "outline"}
                    className={
                      usage.status === "running"
                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 capitalize"
                        : "capitalize"
                    }
                  >
                    {usage.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No usage history found.
          </p>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <HistoryLoadMoreButton loading={loading} fetchHistory={fetchHistory} />
      )}
    </TabsContent>
  );
}
