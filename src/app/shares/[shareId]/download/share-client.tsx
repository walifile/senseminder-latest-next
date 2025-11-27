"use client";

 
import { useGetShareInfoQuery } from "@/api/fileManagerAPI";
import { buildSharedFileView } from "@/app/dashboard/sense-cloud/utils";
import SharedFileViewer from "@/app/dashboard/sense-cloud/_components/shared-file-viewer";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Download as DownloadIcon } from "lucide-react";

export default function Client({ shareId }: { shareId: string }) {
  const { data, isLoading, isError } = useGetShareInfoQuery({ shareId });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl pt-32 pb-24">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Loading…</CardTitle>
            <CardDescription>Fetching link details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto max-w-3xl pt-32 pb-24">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Link not found</CardTitle>
            <CardDescription>This shared link may be invalid.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (data.status !== "active") {
    return (
      <div className="container mx-auto max-w-3xl pt-32 pb-24">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Link unavailable</CardTitle>
            <CardDescription>This link is {data.status}.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { fileName, ext, expires, downloadUrl, previewUrl } = buildSharedFileView(
    shareId,
    data.name,
    data.expiresAt
  );

  return (
    <div className="container mx-auto max-w-6xl pt-32 pb-12">
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 space-y-0">
          <div className="min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <CardTitle className="truncate text-xl sm:text-2xl max-w-[65vw] sm:max-w-[44rem]">
                {fileName}
              </CardTitle>
              {ext && (
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  {ext}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1">
              Public link • {expires ? `Expires ${expires}` : "No expiry"}
            </CardDescription>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <a href={downloadUrl}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/10 p-2 sm:p-3">
            <SharedFileViewer name={fileName} previewUrl={previewUrl} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
