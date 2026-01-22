"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { Search as SearchIcon } from "lucide-react";

type DashboardSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string; // extra layout tweaks from parent if needed
};

const DashboardSearch: React.FC<DashboardSearchProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  id = "dashboard-search",
  name,
  className,
}) => (
    <div className={cn("relative flex-1", className)}>
      <div
        className="
          bg-[rgba(37,48,240,0.07)]
          dark:bg-[#ffffff08]
          rounded-[1000px]
          border-[none]
          relative
          before:content-['']
          before:absolute before:inset-0
          before:p-px before:rounded-[1000px]
          before:[background:linear-gradient(270deg,rgba(168,1,186,0.5)_0%,rgba(37,48,240,0.5)_100%)]
          before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
          before:[-webkit-mask-composite:xor]
          before:[mask-composite:exclude]
          before:z-[1]
          before:pointer-events-none
        "
      >
        {/* Search icon on the left, with border but no glow */}
        <SearchIcon
          className="
            absolute top-1/2 left-1.5 h-10 w-10 -translate-y-1/2
            p-2
            text-[#2530F0] dark:text-white
            bg-transparent
            rounded-[23px]
            border border-solid border-[#2B2F46] dark:border-[#2B2F46]
          "
        />

        <Input
          id={id}
          name={name ?? id}
          placeholder={placeholder}
          className="h-14 flex-1 rounded-full border-none bg-transparent pl-14 pr-6 md:text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );

export default DashboardSearch;
