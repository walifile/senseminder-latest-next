"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSharedFile() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center pt-32 pb-24">
      <Card className="w-full max-w-2xl shadow-sm">
        <CardHeader>
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-5 w-1/3 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[58vh] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
