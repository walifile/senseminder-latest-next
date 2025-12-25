import { useMemo, useState } from "react";
import { useLazySearchRechargeHistoryQuery } from "@/api/billing";

import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { TabsContent } from "@/components/ui/tabs";
import { fCurrency } from "@/lib/utils/format-number";

import { Copy, ArrowUpRight, ArrowDownLeft } from "lucide-react";

import HistoryFilters from "./history-filters";
import { useHistoryData } from "../hooks/use-history-data";
import HistoryLoadMoreButton from "./history-load-more-button";

import type { Recharge } from "../types";

// Helper function to format event type for display
const formatEventType = (eventType: string): string => {
  const eventTypeMap: Record<string, string> = {
    RECHARGE_WALLET: "Recharge",
    REFUND_PROCESSED: "Refund",
    CASHBACK_ADDED: "Cashback",
    PROMO_BALANCE_ADDED: "Promo",
  };
  return eventTypeMap[eventType] || eventType;
};

// Helper function to get transaction ID
const getTransactionId = (recharge: Recharge): string | null => {
  const { eventType, details } = recharge;

  if (!details) return null;

  switch (eventType) {
    case "RECHARGE_WALLET":
      return details.paymentIntentId || null;
    case "REFUND_PROCESSED":
      return details.paymentIntentId || details.refundId || null;
    default:
      return null;
  }
};

// Helper function to get card info
const getCardInfo = (recharge: Recharge): string | null => {
  if (
    recharge.eventType === "RECHARGE_WALLET" &&
    recharge.details?.paymentMethodDisplay
  ) {
    return recharge.details.paymentMethodDisplay;
  }
  return null;
};

// Helper to get badge color classes based on event type
const getEventBadgeClasses = (eventType: string): string => {
  switch (eventType) {
    case "RECHARGE_WALLET":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "REFUND_PROCESSED":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "CASHBACK_ADDED":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "PROMO_BALANCE_ADDED":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

// ✅ avoids TS error without using `any`
type RechargeWithStatus = Recharge & { status?: string };

export function RechargeHistoryTab() {
  const [query, setQuery] = useState("");

  const { filteredHistory, date, setDate, loading, hasMore, fetchHistory } =
    useHistoryData<Recharge>({
      lazyQueryHook: useLazySearchRechargeHistoryQuery,
      query,
    });

  const handleRefresh = async () => {
    await fetchHistory(false);
  };

  // ✅ transaction count + net calculator (UI-only)
  const summary = useMemo(() => {
    const total = filteredHistory.reduce((acc, r) => {
      const isRefund = r.eventType === "REFUND_PROCESSED";
      const amt = Number(r.amount ?? 0);
      return acc + (isRefund ? -amt : amt);
    }, 0);

    const refunds = filteredHistory.filter(
      (r) => r.eventType === "REFUND_PROCESSED"
    ).length;

    return { count: filteredHistory.length, refunds, total };
  }, [filteredHistory]);

  return (
    <TabsContent
      data-testid="dashboard-billing-recharge-history"
      value="recharge"
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
        showSearch={false}
      />

      {/* Summary row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {summary.count} transactions
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {summary.refunds} refunds
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-sm text-muted-foreground">Net</span>
          <span
            className={`text-sm font-semibold tabular-nums ${
              summary.total < 0
                ? "text-destructive"
                : "text-green-600 dark:text-green-500"
            }`}
          >
            {summary.total < 0 ? "-" : "+"}
            {fCurrency(Math.abs(summary.total))}
          </span>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading recharge history...
            </p>
          ) : filteredHistory.length > 0 ? (
            <table className="w-full text-sm table-fixed">
              {/* ✅ keep Transaction wide, and make the last 4 columns equal width => same gap */}
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
                    Transaction
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm">
                    Transaction ID
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm hidden md:table-cell">
                    Payment Method
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm">
                    Amount
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-sm">
                    Status
                  </th>
                </tr>
              </thead>

              {/* ✅ all row content vertically centered */}
              <tbody className="divide-y [&>tr>td]:align-middle">
                {filteredHistory.map((recharge, index) => {
                  const txnId = getTransactionId(recharge);
                  const cardInfo = getCardInfo(recharge);
                  const formattedDate = new Date(
                    recharge.eventTimestamp
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  const isRefund = recharge.eventType === "REFUND_PROCESSED";

                  const statusText =
                    (recharge as RechargeWithStatus).status || "completed";
                  const isCompleted =
                    String(statusText).toLowerCase() === "completed";

                  return (
                    <tr
                      key={`${recharge.eventTimestamp}-${index}`}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {/* Transaction */}
                      <td className="pl-4 pr-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10 shrink-0">
                            {isRefund ? (
                              <ArrowDownLeft className="h-4 w-4 text-orange-600" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-primary" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getEventBadgeClasses(
                                  recharge.eventType
                                )}`}
                              >
                                {formatEventType(recharge.eventType)}
                              </span>

                              <span className="text-xs text-muted-foreground">
                                {formattedDate}
                              </span>
                            </div>

                            {cardInfo ? (
                              <p className="text-sm font-medium mt-1 md:hidden truncate max-w-[280px]">
                                {cardInfo}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          {txnId ? (
                            <div className="flex items-center gap-2 min-w-0 w-full max-w-[180px] justify-center">
                              <code className="text-xs text-muted-foreground truncate">
                                {txnId}
                              </code>
                              <button
                                type="button"
                                className="inline-flex items-center shrink-0"
                                aria-label="Copy transaction ID"
                                onClick={() => {
                                  navigator.clipboard.writeText(txnId);
                                  toast({
                                    title: "Copied!",
                                    description:
                                      "Transaction ID copied to clipboard.",
                                  });
                                }}
                              >
                                <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment method */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex justify-center">
                          <span className="text-sm text-muted-foreground truncate block max-w-[200px] text-center">
                            {cardInfo || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="font-medium tabular-nums whitespace-nowrap rounded-full px-3 py-1"
                          >
                            {isRefund ? "-" : "+"}
                            {fCurrency(recharge.amount)}
                          </Badge>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <Badge
                            className={
                              isCompleted
                                ? "rounded-full px-3 py-1 text-xs font-semibold bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950"
                                : "rounded-full px-3 py-1 text-xs font-semibold"
                            }
                          >
                            {statusText}
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
              No recharge history found.
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
