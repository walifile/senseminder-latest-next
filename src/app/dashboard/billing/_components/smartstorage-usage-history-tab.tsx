import { useMemo } from "react";
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

import type { StorageUsageHistory } from "../types";

export function SmartStorageUsageHistoryTab() {
  const { filteredHistory, date, setDate, loading, hasMore, fetchHistory } =
    useHistoryData<StorageUsageHistory>({
      lazyQueryHook: useLazySearchUsageHistoryQuery,
      additionalParams: { isStorageHistory: true },
    });

  const handleRefresh = async () => {
    await fetchHistory(false);
  };

  const summary = useMemo(() => {
    const total = filteredHistory.reduce(
      (acc, r) => acc + Number(r.billingAmount ?? 0),
      0
    );
    return { count: filteredHistory.length, total };
  }, [filteredHistory]);

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

      {/* Summary */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {summary.count} records
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-sm text-muted-foreground">Total billed</span>
          <span className="text-sm font-semibold tabular-nums">
            {fCurrency(summary.total)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading usage history...
            </p>
          ) : filteredHistory.length > 0 ? (
            <table className="w-full min-w-[640px] text-sm table-fixed">
              {/* ✅ Match style: Usage wide, last 3 columns equal width (same gap) */}
              <colgroup>
                <col className="w-[61%]" />
                <col className="hidden w-[13%] md:table-cell" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
              </colgroup>

              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr className="border-b">
                  <th className="text-left pl-[60px] pr-4 py-4 font-semibold text-sm">
                    Usage
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm hidden md:table-cell">
                    Plan
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm">
                    Amount
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm">
                    Status
                  </th>
                </tr>
              </thead>

              {/* ✅ Vertical center like other tables */}
              <tbody className="divide-y [&>tr>td]:align-middle">
                {filteredHistory.map((usage, index) => {
                  const range = `${formatDateTime(usage.startTime)} - ${formatDateTime(
                    usage.endTime
                  )}`;

                  return (
                    <tr
                      key={`${usage.timestamp}-${index}`}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {/* Usage */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10 shrink-0">
                            <Database className="h-4 w-4 text-primary" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">
                                Max storage: {formatStorageGB(usage.maxStorage)}
                              </p>

                              {/* mobile plan pill */}
                              <Badge variant="outline" className="text-xs md:hidden">
                                {usage.billingPlan}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mt-1">{range}</p>

                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Billed: {formatDateTime(usage.timestamp)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Plan (desktop) */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="text-xs rounded-full px-3 py-1"
                          >
                            {usage.billingPlan}
                          </Badge>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="font-medium tabular-nums whitespace-nowrap rounded-full px-3 py-1"
                          >
                            {fCurrency(usage.billingAmount)}
                          </Badge>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <Badge className="rounded-full px-3 py-1 text-xs font-semibold bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950">
                            completed
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No usage history found.
            </p>
          )}
        </div>
      </div>

      {/* Load More */}
      {hasMore && (
        <HistoryLoadMoreButton loading={loading} fetchHistory={fetchHistory} />
      )}
    </TabsContent>
  );
}
