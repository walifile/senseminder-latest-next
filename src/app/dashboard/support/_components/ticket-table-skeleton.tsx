
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TicketTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>Track and manage your requests</CardDescription>

        {/* Search + filter bar skeleton */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Skeleton className="h-9 w-full max-w-md rounded-full" />
          <Skeleton className="h-9 w-[150px] rounded-md" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-auto rounded-md border">
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
                    className="px-4 py-3 text-left border-b border-gray-200"
                  >
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gray-200">
                  {Array.from({ length: 7 }).map((_, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-4 py-4 border-b border-gray-100"
                    >
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
