/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DateRange } from "react-day-picker";

import { useState, useEffect, useCallback } from "react";

import { Logger } from "@/lib/utils/logger";
import { toast } from "@/components/ui/use-toast";

interface UseHistoryDataProps<T> {
  lazyQueryHook: any;
  additionalParams?: Record<string, any>;
  filterFunction?: (item: T, query: string) => boolean;
  query?: string;
}

export function useHistoryData<T>({
  lazyQueryHook,
  additionalParams = {},
  filterFunction,
  query = "",
}: UseHistoryDataProps<T>) {
  const [allHistory, setAllHistory] = useState<T[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({ from: undefined });
  const [hasMore, setHasMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);

  const [fetchHistoryTrigger, { isLoading: loading }] = lazyQueryHook();

  const fetchHistory = useCallback(async (isLoadMore = false) => {
    try {
      const params = {
        from: date?.from,
        to: date?.to,
        limit: 5,
        startingAfter: lastEvaluatedKey,
        ...additionalParams,
      };

      const result = await fetchHistoryTrigger(params).unwrap();
      const newHistory = result.items || result.history || [];

      setAllHistory((prev) =>
        isLoadMore ? [...prev, ...newHistory] : newHistory
      );

      setHasMore(result.hasMore || result.hasNextPage);

      if (result.lastEvaluatedKey) {
        const encodedKey =
          typeof result.lastEvaluatedKey === "string"
            ? result.lastEvaluatedKey
            : encodeURIComponent(JSON.stringify(result.lastEvaluatedKey));
        setLastEvaluatedKey(encodedKey);
      } else {
        setLastEvaluatedKey(null);
      }
    } catch (error: unknown) {
      Logger.error("Failed to fetch history", error);
      const message =
        error && typeof error === "object" && "message" in error
          ? (error as Error).message
          : "Could not fetch history";
      toast({
        title: "Error loading history",
        description: message,
      });
    }
  }, [date, lastEvaluatedKey, additionalParams, fetchHistoryTrigger]);

  useEffect(() => {
    setAllHistory([]);
    setLastEvaluatedKey(null);
    fetchHistory(false);
  }, [date, fetchHistory]);

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
