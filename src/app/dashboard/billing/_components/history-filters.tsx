import type { DateRange } from "react-day-picker";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import { Search, RotateCw } from "lucide-react";

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
  query,
  setQuery,
  onRefresh,
  isRefreshing = false,
}: Props) => (
  <div className="flex flex-col sm:flex-row gap-4 items-end">
    <DatePickerWithRange date={date} setDate={setDate} />
    {showSearch ? (
      <div className="relative flex items-center w-full sm:w-96">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-8 pr-10"
          value={query}
          onChange={(e) => setQuery?.(e.target.value)}
        />
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 h-8 w-8 p-0"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>
    ) : (
      onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      )
    )}
  </div>
);

export default HistoryFilters;
