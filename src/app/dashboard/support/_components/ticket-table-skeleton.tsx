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
        <div className="rounded-md border">
          {/* Table header skeleton */}
          <div className="grid grid-cols-4 md:grid-cols-6 p-4 font-medium border-b bg-muted/50 text-sm text-muted-foreground">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-32 col-span-2" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-4 w-16 hidden md:block" />
          </div>

          {/* Table rows skeleton */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 md:grid-cols-6 p-4 items-center gap-2 border-b"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-40 col-span-2" />
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-5 w-16 rounded-full hidden md:block" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
