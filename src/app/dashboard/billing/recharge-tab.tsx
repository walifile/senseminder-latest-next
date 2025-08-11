import { useEffect, useState } from "react";
import { ArrowUpRight, Copy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { searchRechargeHistory } from "@/api/billing";
import { DateRange } from "react-day-picker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Recharge {
  txnId: string;
  amount: string;
  date: string;
  status: "completed" | "failed";
  paymentMethod: string;
}

export function RechargeHistoryTab() {
  const [allHistory, setAllHistory] = useState<Recharge[]>([]);
  const [date, setDate] = useState<DateRange| undefined>({from: undefined});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);

  const fetchHistory = async (isLoadMore = false) => {
    setLoading(true);
    try {

      const data = await searchRechargeHistory({from: date?.from, to: date?.to, limit: 5, startingAfter: lastEvaluatedKey})
      
      const newHistory = data.history || [];

      setAllHistory((prev) => isLoadMore ? [...prev, ...newHistory] : newHistory);
      setHasMore(data.hasNextPage);
      setLastEvaluatedKey(data.lastEvaluatedKey);
    } catch (error: unknown) {
      console.error("Failed to fetch recharge history", error);
      const message =
        error instanceof Error
            ? error.message
            : "Could not fetch recharge history";
        toast({
            title: "Error loading recharge history",
            description: message,
        });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset when filters change
    setAllHistory([]);
    setLastEvaluatedKey(null);
    fetchHistory(false);
  }, [date]);

  const filteredHistory = allHistory.filter((item) =>
    item.txnId.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <TabsContent value="recharge" className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <DatePickerWithRange date={date} setDate={setDate} />
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* History List */}
      <div className="rounded-lg border max-h-[400px] overflow-y-auto divide-y">
        {filteredHistory.length > 0 ? (
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
                                  description: "Transaction ID copied to clipboard.",
                                });
                              }
                            }}
                          >
                            <p className="font-medium">
                              {recharge.txnId ? recharge.txnId.slice(0, 16)+"..." : "-"}
                            </p>
                            {recharge.txnId && <Copy className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {recharge.txnId}
                        </TooltipContent>
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
                <Badge variant={recharge.status === "completed" ? "default" : "destructive"}>
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
        <div className="flex justify-center pt-4">
          <button
            className="text-sm px-4 py-2 rounded-md bg-primary text-white disabled:opacity-50"
            onClick={() => fetchHistory(true)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </TabsContent>
  );
}
