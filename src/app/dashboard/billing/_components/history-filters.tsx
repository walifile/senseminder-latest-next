import type { DateRange } from "react-day-picker";

import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import { Search } from "lucide-react";

interface Props {
  date: DateRange | undefined;
  setDate: (range: DateRange | undefined) => void;
  showSearch?: boolean;
  query?: string;
  setQuery?: (value: string) => void;
}

const HistoryFilters = ({
  date,
  setDate,
  showSearch = true,
  query,
  setQuery,
}: Props) => (
  <div className="flex flex-col sm:flex-row gap-4">
    <DatePickerWithRange date={date} setDate={setDate} />
    {showSearch && (
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-8"
          value={query}
          onChange={(e) => setQuery?.(e.target.value)}
        />
      </div>
    )}
  </div>
);

export default HistoryFilters;
