"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function TicketTableSkeleton() {
  return (
    <>
      <div className="p-6 pt-0 space-y-5 border-b border-black/10 dark:border-border">
        <div className="space-y-1">
          <div className="justify-start text-[#020816] dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8">
            Sense Cloud
          </div>
          <div className="justify-start text-[#454545] dark:text-[#B9C2D5] text-base font-normal font-['Inter'] leading-6">
            Our support team will respond as soon as possible.
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <div className="bg-[rgba(37,48,240,0.07)] dark:bg-[#ffffff08] rounded-[1000px] border-[none] relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[1000px] before:[background:linear-gradient(270deg,rgba(168,1,186,0.5)_0%,rgba(37,48,240,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
              <Skeleton className="h-9 w-full max-w-md rounded-full" />
            </div>
          </div>
          {/* Status Filter */}
          <div className="flex items-center self-end gap-4">
            <label className="text-sm text-muted-foreground">Status:</label>
            <Skeleton className="h-9 w-[150px] rounded-md" />
          </div>
        </div>
      </div>

      <div className="p-6 overflow-auto">
        <table className="min-w-[1000px] w-full text-sm border-separate border-spacing-0">
          <thead className="bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-muted/50">
            <tr>
              {[
                "Created",
                "ID",
                "Subject",
                "Last activity",
                "Status",
                "Email",
                "Role",
              ].map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left border-b border-[#2530F033] dark:border-[#ffffff1a]"
                >
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-[#2530F033] dark:border-[#ffffff1a]">
                {Array.from({ length: 7 }).map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-4 py-4 border-b border-[#2530F01a] dark:border-[#ffffff0d]"
                  >
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
