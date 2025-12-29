import { useMemo, useState } from "react";
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

  // ✅ record count + total billed (UI only)
  const summary = useMemo(() => {
    const total = filteredHistory.reduce(
      (acc, r) => acc + Number(r.billingAmount ?? 0),
      0
    );
    return { count: filteredHistory.length, total };
  }, [filteredHistory]);

  return (
    <TabsContent
      data-testid="dashboard-billing-usage-history"
      value="usage"
      className="space-y-4"
    >
      {/* Filters */}
      <HistoryFilters
        date={date}
        setDate={setDate}
        query={query}
        setQuery={setQuery}
        onRefresh={handleRefresh}
        isRefreshing={loading}
      />

      {/* ✅ Summary row (same as other tab) */}
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

      {/* History Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading usage history...
            </p>
          ) : filteredHistory.length > 0 ? (
            <table
              data-testid="dashboard-billing-usage-list"
              className="w-full text-sm table-fixed"
            >
              {/* ✅ Match Recharge-style spacing: Usage wide, last 4 columns equal width */}
              <colgroup>
                <col className="w-[48%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
              </colgroup>

              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr className="border-b">
                  <th className="text-left pl-[60px] pr-4 py-4 font-semibold text-sm">
                    Usage
                  </th>

                  <th className="text-left pl-[63px] px-4 py-4 font-semibold text-sm">
                    Cost
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm">
                    Wallet
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm">
                    Amount
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm">
                    Status
                  </th>
                </tr>
              </thead>

              {/* ✅ Vertical center for ALL cells (same as recharge table) */}
              <tbody className="divide-y [&>tr>td]:align-middle">
                {filteredHistory.map((usage, index) => {
                  const promo = usage.promoDeduction ?? 0;
                  const cashback = usage.cashbackDeduction ?? 0;
                  const wallet = usage.balanceDeduction ?? 0;

                  const chargedFrom = [
                    { label: "Promo", value: promo },
                    { label: "Cashback", value: cashback },
                    { label: "Wallet", value: wallet },
                  ].filter((x) => Number(x.value) > 0);

                  return (
                    <tr
                      key={`${usage.timestamp}-${index}`}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {/* Usage */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10 shrink-0">
                            <Monitor className="h-4 w-4 text-primary" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{usage.systemName}</p>
                              <Badge variant="outline" className="text-xs">
                                {usage.billingPlan}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mt-1">
                              {getUsagePeriod(usage)}
                            </p>

                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Billed: {formatDateTime(usage.timestamp)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cost (centered) */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <div className="w-full max-w-[220px] text-xs text-muted-foreground leading-tight text-left">
                            <div className="whitespace-nowrap">
                              🖥 CPU + Mem: {fCurrency(usage.instanceCost)}
                            </div>
                            <div className="whitespace-nowrap mt-0.5 ml-11">
                              💾 SSD: {fCurrency(usage.storageCost)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Breakdown (centered) */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <div className="text-xs text-muted-foreground leading-tight text-left">
                            <p className="font-medium text-muted-foreground">💸 Breakdown</p>

                            {chargedFrom.length > 0 ? (
                              chargedFrom.map((x) => (
                                <p key={x.label}>
                                  • {x.label}: {fCurrency(x.value)}
                                </p>
                              ))
                            ) : (
                              <p className="text-muted-foreground/70">—</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Amount (centered) */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <Badge
                            variant="outline"
                            className="font-medium tabular-nums whitespace-nowrap rounded-full px-3 py-1"
                          >
                            {fCurrency(usage.billingAmount)}
                          </Badge>
                          {usage.partialCharge && (
                            <span className="text-xs text-muted-foreground">
                              (partial charge)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status (centered) */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <Badge
                            variant={usage.status === "running" ? "default" : "outline"}
                            className={
                              usage.status === "running"
                                ? "rounded-full px-3 py-1 text-xs font-semibold bg-green-500/10 text-green-500 hover:bg-green-500/20 capitalize"
                                : "rounded-full px-3 py-1 text-xs font-semibold capitalize"
                            }
                          >
                            {usage.status}
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
