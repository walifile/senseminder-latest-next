import { useEffect, useState } from "react";
import { Monitor, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { searchUsageHistory } from "@/api/billing";
import { DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { formatDateTime } from "@/lib/utils/format-time";

interface UsageHistory {
  instanceId: string;
  timestamp: string;
  billingAmount: string;
  billingPlan: string;
  startTime: string;
  endTime: string;
  instanceMinutes: string;
  storageMinutes: string;
  storageBillingStartTime: string;
  storageBillingEndTime: string;
  systemName: string;
  status: string;
  instanceCost: string;
  storageCost: string;
}

export function SmartPCUsageHistoryTab() {
  const [allHistory, setAllHistory] = useState<UsageHistory[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({ from: undefined });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);

  const fetchHistory = async (isLoadMore = false) => {
    setLoading(true);
    try {
      const data = await searchUsageHistory({
        from: date?.from,
        to: date?.to,
        limit: 5,
        startingAfter: lastEvaluatedKey,
      });

      const newHistory = data.items || [];

      setAllHistory((prev) =>
        isLoadMore ? [...prev, ...newHistory] : newHistory
      );
      setHasMore(data.hasMore);
      if (data.lastEvaluatedKey) {
        const encodedKey = encodeURIComponent(
          JSON.stringify(data.lastEvaluatedKey)
        );
        setLastEvaluatedKey(encodedKey);
      } else {
        setLastEvaluatedKey(null);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch usage history", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not fetch usage history";
      toast({
        title: "Error loading usage history",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatInstanceDuration = (minutesStr: string, billingPlan: string) => {
    const plan = billingPlan.toLowerCase();
    const minutesNum = Math.max(parseFloat(minutesStr), 0); // ensure it's a non-negative number

    if (plan === "hourly") {
      const hours = Math.floor(minutesNum / 60);
      const minutes = Math.round(minutesNum % 60);

      const hoursPart =
        hours > 0 ? `${hours} ${hours === 1 ? "hr" : "hrs"}` : "";
      const minutesPart =
        minutes > 0 ? `${minutes} ${minutes === 1 ? "min" : "mins"}` : "";

      return `${hoursPart} ${minutesPart}`.trim() || "0 minutes";
    } else if (plan === "daily") {
      return "24 hours";
    } else if (plan === "monthly") {
      return "1 month";
    } else {
      return `${minutesNum} min`;
    }
  };

  useEffect(() => {
    // Reset when filters change
    setAllHistory([]);
    setLastEvaluatedKey(null);
    fetchHistory(false);
  }, [date]);

  const filteredHistory = allHistory.filter((item) =>
    item.systemName?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <TabsContent value="usage" className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <DatePickerWithRange date={date} setDate={setDate} />
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search usage history..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

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
                    {parseFloat(usage.instanceMinutes) >
                    parseFloat(usage.storageMinutes)
                      ? `${formatDateTime(usage.startTime)} - ${formatDateTime(
                          usage.endTime
                        )}`
                      : `${formatDateTime(
                          usage.storageBillingStartTime
                        )} - ${formatDateTime(usage.storageBillingEndTime)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* ➕ Billing Cost Breakdown */}
                <div className="text-xs text-muted-foreground text-right">
                  🖥 Instance: ${parseFloat(usage.instanceCost).toFixed(2)} (
                  {formatInstanceDuration(
                    usage.instanceMinutes,
                    usage.billingPlan
                  )}
                  ) <br />
                  💾 Storage: ${parseFloat(usage.storageCost).toFixed(2)} (
                  {formatInstanceDuration(
                    usage.storageMinutes,
                    usage.billingPlan
                  )}
                  )
                </div>
                <Badge variant="secondary" className="font-medium">
                  ${parseFloat(usage.billingAmount).toFixed(2)}
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
