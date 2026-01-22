"use client";

import { useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  name: string;
  previewUrl: string;
};

export default function SharedFileViewer({ name, previewUrl }: Props) {
  const [loaded, setLoaded] = useState(false);
  const ext = useMemo(
    () => (name.split(".").pop()?.toLowerCase() || ""),
    [name]
  );

  const skeleton = (
    <div className="flex items-center justify-center w-full h-[60vh] sm:h-[70vh]">
      <div className="w-full max-w-3xl space-y-3">
        <Skeleton className="h-8 w-1/3 mx-auto" />
        <Skeleton className="h-[48vh] sm:h-[58vh] w-full" />
      </div>
    </div>
  );

  if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)) {
    return (
      <div data-testid="dashboard-sense-cloud-shared-file-viewer" className="w-full">
        {!loaded && skeleton}
        <img
          src={previewUrl}
          alt={name}
          onLoad={() => setLoaded(true)}
          className={`max-h-[70vh] w-full object-contain ${loaded ? "block" : "hidden"}`}
        />
      </div>
    );
  }

  if (ext === "pdf") {
    return (
      <div data-testid="dashboard-sense-cloud-shared-file-viewer" className="w-full">
        {!loaded && skeleton}
        <iframe
          src={previewUrl}
          title={name}
          onLoad={() => setLoaded(true)}
          className={`w-full h-[70vh] ${loaded ? "block" : "hidden"}`}
        />
      </div>
    );
  }

  if (["mp4", "webm", "ogg", "mov", "quicktime"].includes(ext)) {
    return (
      <div data-testid="dashboard-sense-cloud-shared-file-viewer" className="w-full">
        {!loaded && skeleton}
        <video
          src={previewUrl}
          controls
          onLoadedData={() => setLoaded(true)}
          className={`w-full max-h-[70vh] ${loaded ? "block" : "hidden"}`}
        />
      </div>
    );
  }

  if (["mp3", "wav", "oga", "ogg"].includes(ext)) {
    return (
      <div data-testid="dashboard-sense-cloud-shared-file-viewer" className="w-full">
        {!loaded && skeleton}
        <audio
          src={previewUrl}
          controls
          onLoadedData={() => setLoaded(true)}
          className={`${loaded ? "block" : "hidden"}`}
        />
      </div>
    );
  }

  return (
    <div
      data-testid="dashboard-sense-cloud-shared-file-viewer"
      className="text-sm text-muted-foreground"
    >
      Preview not available. Use the download button.
    </div>
  );
}
