import { useLazySearchUsageHistoryQuery } from "@/api/billing";

import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { fCurrency } from "@/lib/utils/format-number";
import { formatDateTime } from "@/lib/utils/format-time";

import { Database } from "lucide-react";

import { formatStorageGB } from "../utils";
import HistoryFilters from "./history-filters";
import { useHistoryData } from "../hooks/use-history-data";
import HistoryLoadMoreButton from "./history-load-more-button";

import type { UsageHistory } from "../types";

export function SmartStorageUsageHistoryTab() {
  const { filteredHistory, date, setDate, loading, hasMore, fetchHistory } =
    useHistoryData<UsageHistory>({
      lazyQueryHook: useLazySearchUsageHistoryQuery,
      additionalParams: { isStorageHistory: true },
    });

  const handleRefresh = async () => {
    await fetchHistory(false);
  };

  return (
    <TabsContent
      data-testid="dashboard-billing-storage-history"
      value="storage-usage"
      className="space-y-4"
    >
      {/* Filters */}
      <HistoryFilters
        date={date}
        setDate={setDate}
        showSearch={false}
        onRefresh={handleRefresh}
        isRefreshing={loading}
      />

      {/* History List */}
      <div
        data-testid="dashboard-billing-storage-list"
        className="rounded-lg border max-h-[400px] overflow-y-auto divide-y"
      >
        {filteredHistory.length > 0 ? (
          filteredHistory.map((usage) => (
            <div
              key={usage.timestamp}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      Max storage: {formatStorageGB(usage.maxStorage)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {usage.billingPlan}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {`${formatDateTime(usage.startTime)} - ${formatDateTime(
                      usage.endTime
                    )}`}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Billed: {formatDateTime(usage.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="font-medium">
                  {fCurrency(usage.billingAmount)}
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
