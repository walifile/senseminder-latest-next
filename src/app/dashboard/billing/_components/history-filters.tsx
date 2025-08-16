import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

interface Props {
  date: any;
  setDate: any;
  showSearch?: boolean;
  query?: string;
  setQuery?: any;
}

const HistoryFilters = ({
  date,
  setDate,
  showSearch = true,
  query,
  setQuery,
}: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <DatePickerWithRange date={date} setDate={setDate} />
      {showSearch && (
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default HistoryFilters;
