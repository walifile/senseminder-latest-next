

import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import DashboardSearch from "@/components/ui/dashboard/search";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import { RotateCw } from "lucide-react";

interface Props {
  date: DateRange | undefined;
  setDate: (range: DateRange | undefined) => void;
  showSearch?: boolean;
  query?: string;
  setQuery?: (value: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const HistoryFilters = ({
  date,
  setDate,
  showSearch = true,
  query = "",
  setQuery,
  onRefresh,
  isRefreshing = false,
}: Props) => (
  <div
    data-testid="dashboard-billing-history-filters"
    className="flex flex-col gap-4 lg:flex-row lg:items-end"
  >
      {/* ✅ Search first (long) */}
      {showSearch ? (
        <DashboardSearch
          value={query}
          onChange={(v) => setQuery?.(v)}
          placeholder="Search transactions..."
          className="w-full lg:flex-1"
        />
      ) : null}

      {/* ✅ Date range + refresh */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
        <DatePickerWithRange date={date} setDate={setDate} />

        {onRefresh ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-12 w-12 shrink-0"
            aria-label="Refresh"
            title="Refresh"
          >
            <RotateCw className={isRefreshing ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
          </Button>
        ) : null}
      </div>
    </div>
  );

export default HistoryFilters;
