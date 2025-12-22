import { useState } from "react";
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
      return details.refundId || details.paymentIntentId || null;
    default:
      return null;
  }
};

// Helper function to get card info
const getCardInfo = (recharge: Recharge): string | null => {
  if (recharge.eventType === "RECHARGE_WALLET" && recharge.details?.paymentMethodDisplay) {
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

      {/* History Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading recharge history...
            </p>
          ) : filteredHistory.length > 0 ? (
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">Transaction</th>
                  <th className="text-left p-4 font-semibold text-sm">Payment Method</th>
                  <th className="text-right p-4 font-semibold text-sm">Amount</th>
                  <th className="text-right p-4 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
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

                  return (
                    <tr
                      key={`${recharge.eventTimestamp}-${index}`}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            {isRefund ? (
                              <ArrowDownLeft className="h-4 w-4 text-orange-600" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getEventBadgeClasses(recharge.eventType)}`}>
                                {formatEventType(recharge.eventType)}
                              </span>
                            </div>
                            {txnId && (
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-base text-muted-foreground">
                                  {txnId.slice(0, 20)}...
                                </p>
                                <Copy
                                  className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                  onClick={() => {
                                    navigator.clipboard.writeText(txnId);
                                    toast({
                                      title: "Copied!",
                                      description: "Transaction ID copied to clipboard.",
                                    });
                                  }}
                                />
                              </div>
                            )}
                            <p className="text-base text-muted-foreground mt-1">
                              {formattedDate}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {cardInfo && (
                          <p className="text-sm font-medium">
                            {cardInfo}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`font-medium ${isRefund ? 'text-destructive' : 'text-green-600 dark:text-green-500'}`}>
                          {isRefund ? '-' : '+'}{fCurrency(recharge.amount)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Badge variant="default">Completed</Badge>
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
