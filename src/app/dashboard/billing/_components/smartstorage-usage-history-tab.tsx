import { useEffect, useState } from "react";
import { Database  } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { searchUsageHistory } from "@/api/billing";
import { DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";

interface UsageHistory {
  timestamp: string;
  billingAmount: string;
  billingPlan: string;
  startTime: string;
  endTime: string;
  cashback: string;
  maxStorage: string;
  netStorage: string;
}

export function SmartStorageUsageHistoryTab() {
  const [allHistory, setAllHistory] = useState<UsageHistory[]>([]);
  const [date, setDate] = useState<DateRange| undefined>({from: undefined});
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);

  const fetchHistory = async (isLoadMore = false) => {
    setLoading(true);
    try {

      const data = await searchUsageHistory({from: date?.from, to: date?.to, limit: 5, startingAfter: lastEvaluatedKey, isStorageHistory: true})
      
      const newHistory = data.items || [];

      setAllHistory((prev) => isLoadMore ? [...prev, ...newHistory] : newHistory);
      setHasMore(data.hasMore);
      if (data.lastEvaluatedKey) {
        const encodedKey = encodeURIComponent(JSON.stringify(data.lastEvaluatedKey));
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


  const formatDateTime = (isoString: string) => {
    if (!isoString) return "";
    const date = parseISO(isoString);
    return format(date, "yyyy-MM-dd HH:mm");
  };

  const formatStorageGB = (bytesString: string) => {
    const bytes = parseFloat(bytesString);
    if (isNaN(bytes)) return "0 GB";
    const gb = bytes / (1024 ** 3);
    return `${gb.toFixed(2)} GB`;
  };


  useEffect(() => {
    // Reset when filters change
    setAllHistory([]);
    setLastEvaluatedKey(null);
    fetchHistory(false);
  }, [date]);

  return (
    <TabsContent value="storage-usage" className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      {/* History List */}
      <div className="rounded-lg border max-h-[400px] overflow-y-auto divide-y">
        {allHistory.length > 0 ? (
            allHistory.map((usage) => (
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
                        <p className="font-medium">Max storage: {formatStorageGB(usage.maxStorage)}</p>
                        <Badge variant="outline" className="text-xs">
                          {usage.billingPlan}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                      {`${formatDateTime(usage.startTime)} - ${formatDateTime(usage.endTime)}`}
                    </p>

                    </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="font-medium">
                    ${parseFloat(usage.billingAmount).toFixed(2)}
                  </Badge>
                </div>
                
              </div>
            ))
        ) : (
            <p className="text-center text-muted-foreground py-8">
            No usage  history found.
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
