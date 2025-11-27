import { useState } from "react";
import { useLazySearchRechargeHistoryQuery } from "@/api/billing";

import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { Copy, ArrowUpRight } from "lucide-react";

import HistoryFilters from "./history-filters";
import { useHistoryData } from "../hooks/use-history-data";
import HistoryLoadMoreButton from "./history-load-more-button";

import type { Recharge } from "../types";

export function RechargeHistoryTab() {
  const [query, setQuery] = useState("");

  const filterFunction = (item: Recharge, searchQuery: string) =>
    item.txnId.toLowerCase().includes(searchQuery.toLowerCase());

  const { filteredHistory, date, setDate, loading, hasMore, fetchHistory } =
    useHistoryData<Recharge>({
      lazyQueryHook: useLazySearchRechargeHistoryQuery,
      filterFunction,
      query,
    });

  const handleRefresh = async () => {
    await fetchHistory(false);
  };

  return (
    <TabsContent value="recharge" className="space-y-4">
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
            Loading recharge history...
          </p>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((recharge) => (
            <div
              key={recharge?.txnId}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            if (recharge.txnId) {
                              navigator.clipboard.writeText(recharge.txnId);
                              toast({
                                title: "Copied!",
                                description:
                                  "Transaction ID copied to clipboard.",
                              });
                            }
                          }}
                        >
                          <p className="font-medium">
                            {recharge.txnId
                              ? recharge.txnId.slice(0, 16) + "..."
                              : "-"}
                          </p>
                          {recharge.txnId && (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{recharge.txnId}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-sm text-muted-foreground">
                    {new Date(recharge.date).toISOString().split("T")[0]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {recharge.paymentMethod}
                </span>
                <Badge variant="outline" className="font-medium">
                  +${recharge.amount}
                </Badge>
                <Badge
                  variant={
                    recharge.status === "completed" ? "default" : "destructive"
                  }
                >
                  {recharge.status}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No recharge history found.
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
