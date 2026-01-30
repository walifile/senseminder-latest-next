"use client";

import { useState } from "react";
import { useGetShareInfoQuery } from "@/api/fileManagerAPI";
import { buildSharedFileView } from "@/app/dashboard/sense-cloud/utils";
import SharedFileViewer from "@/app/dashboard/sense-cloud/_components/shared-file-viewer";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DOWNLOAD_LINK_MISSING_MESSAGE,
  DOWNLOAD_UNAVAILABLE_TITLE,
  INVALID_LINK_MESSAGE,
  TEMP_UNAVAILABLE_MESSAGE,
} from "@/app/dashboard/sense-cloud/constants/share-messages";
import { getShareStatusMessage } from "@/app/dashboard/sense-cloud/utils";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Loader2, Download as DownloadIcon } from "lucide-react";

const fetchDownloadUrl = async (
  shareId: string
): Promise<{ downloadUrl?: string; message?: string }> => {
  const res = await fetch(
    `/api/share/${shareId}?disposition=attachment&mode=json`,
    {
      headers: { Accept: "application/json" },
    }
  );

  const payload = (await res.json().catch(() => ({}))) as {
    downloadUrl?: string;
    message?: string;
  };

  if (!res.ok) {
    return { message: payload.message || INVALID_LINK_MESSAGE };
  }

  if (!payload.downloadUrl) {
    return { message: DOWNLOAD_LINK_MISSING_MESSAGE };
  }

  return { downloadUrl: payload.downloadUrl };
};

export default function Client({ shareId }: { shareId: string }) {
  const { data, isLoading, isError } = useGetShareInfoQuery({ shareId });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { toast } = useToast();

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
    const statusMessage = getShareStatusMessage(data.status);
    return (
      <div className="container mx-auto max-w-3xl pt-32 pb-24">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Link unavailable</CardTitle>
            <CardDescription>{statusMessage}</CardDescription>
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

  const reportDownloadError = (message: string) => {
    setDownloadError(message);
    toast({ title: DOWNLOAD_UNAVAILABLE_TITLE, description: message });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const { downloadUrl: url, message } = await fetchDownloadUrl(shareId);
      if (!url) {
        reportDownloadError(message || INVALID_LINK_MESSAGE);
        return;
      }
      window.location.href = url;
    } catch {
      reportDownloadError(TEMP_UNAVAILABLE_MESSAGE);
    } finally {
      setIsDownloading(false);
    }
  };

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
          <Button
            size="lg"
            className="shrink-0"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </CardHeader>
        {downloadError && (
          <div className="px-6 pb-2 text-sm text-destructive">
            {downloadError}
          </div>
        )}
        <CardContent>
          <div className="rounded-lg border bg-muted/10 p-2 sm:p-3">
            <SharedFileViewer name={fileName} previewUrl={previewUrl} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
