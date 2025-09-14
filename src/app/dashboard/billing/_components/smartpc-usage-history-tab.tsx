import { useState } from "react";
import { useLazySearchUsageHistoryQuery } from "@/api/billing";

import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { fCurrency } from "@/lib/utils/format-number";

import { Monitor } from "lucide-react";

import HistoryFilters from "./history-filters";
import { useHistoryData } from "../hooks/use-history-data";
import HistoryLoadMoreButton from "./history-load-more-button";
import { getUsagePeriod, formatInstanceDuration } from "../utils";

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

  return (
    <TabsContent value="usage" className="space-y-4">
      {/* Filters */}
      <HistoryFilters
        date={date}
        setDate={setDate}
        query={query}
        setQuery={setQuery}
      />

      {/* History List */}
      <div className="rounded-lg border max-h-[400px] overflow-y-auto divide-y">
        {filteredHistory.length > 0 ? (
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
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* ➕ Billing Cost Breakdown */}
                <div className="text-xs text-muted-foreground text-right">
                  🖥 Instance: {fCurrency(usage.instanceCost)} (
                  {formatInstanceDuration(
                    usage.instanceMinutes,
                    usage.billingPlan
                  )}
                  ) <br />
                  💾 Storage: {fCurrency(usage.storageCost)} (
                  {formatInstanceDuration(
                    usage.storageMinutes,
                    usage.billingPlan
                  )}
                  )
                </div>
                <Badge variant="secondary" className="font-medium">
                  {fCurrency(usage.billingAmount)}
                </Badge>

                <Badge
                  variant={usage.status === "running" ? "default" : "outline"}
                  className={
                    usage.status === "running"
                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                      : ""
                  }
                >
                  {usage.status}
                </Badge>
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
