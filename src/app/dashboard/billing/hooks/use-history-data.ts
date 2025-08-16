import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "@/components/ui/use-toast";

interface UseHistoryDataProps<T> {
  fetchFunction: (params: any) => Promise<any>;
  additionalParams?: Record<string, any>;
  filterFunction?: (item: T, query: string) => boolean;
  query?: string;
}

export function useHistoryData<T>({
  fetchFunction,
  additionalParams = {},
  filterFunction,
  query = "",
}: UseHistoryDataProps<T>) {
  const [allHistory, setAllHistory] = useState<T[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({ from: undefined });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);

  const fetchHistory = async (isLoadMore = false) => {
    setLoading(true);
    try {
      const params = {
        from: date?.from,
        to: date?.to,
        limit: 5,
        startingAfter: lastEvaluatedKey,
        ...additionalParams,
      };

      const data = await fetchFunction(params);
      const newHistory = data.items || data.history || [];

      setAllHistory((prev) =>
        isLoadMore ? [...prev, ...newHistory] : newHistory
      );

      setHasMore(data.hasMore || data.hasNextPage);

      if (data.lastEvaluatedKey) {
        const encodedKey =
          typeof data.lastEvaluatedKey === "string"
            ? data.lastEvaluatedKey
            : encodeURIComponent(JSON.stringify(data.lastEvaluatedKey));
        setLastEvaluatedKey(encodedKey);
      } else {
        setLastEvaluatedKey(null);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch history", error);
      const message =
        error instanceof Error ? error.message : "Could not fetch history";
      toast({
        title: "Error loading history",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAllHistory([]);
    setLastEvaluatedKey(null);
    fetchHistory(false);
  }, [date]);

  const filteredHistory = filterFunction
    ? allHistory.filter((item) => filterFunction(item, query))
    : allHistory;

  return {
    allHistory,
    filteredHistory,
    date,
    setDate,
    loading,
    hasMore,
    fetchHistory,
  };
}
