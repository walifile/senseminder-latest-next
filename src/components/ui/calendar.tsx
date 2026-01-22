import * as React from "react";

import { cn } from "@/lib/utils";

// import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        weeks: "flex flex-col",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button:
          "h-9 w-9 p-0 font-normal text-center aria-selected:opacity-100",
        selected:
          "bg-[#2530F0] text-white hover:bg-[#2530F0] hover:text-white focus:bg-[#2530F0] focus:text-white",
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        range_middle:
          "bg-[#2530F0]/15 text-[#2530F0] dark:bg-[#2530F0]/35 dark:text-white",
        today: "bg-accent text-accent-foreground",
        outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      // components={{
      //   IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
      //   IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      // }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
