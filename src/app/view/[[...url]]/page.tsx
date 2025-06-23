"use client";

import FileTypeIcon from "@/app/dashboard/storage/_components/file-type-icon";

export default function ViewFile({ params }: { params: { url: string[] } }) {
  const encoded = params.url.join("/");
  const decodedUrl = decodeURIComponent(encoded);
  const fullPath = decodedUrl.split("/").pop() || "file";
  const fileName = fullPath.split("?")[0];
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const src = decodedUrl;

  let content: React.ReactNode = null;

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
    content = (
      <img
        src={src}
        alt={fileName}
        className="w-full h-[75vh] rounded border"
      />
    );
  } else if (ext === "pdf") {
    content = (
      <iframe
        src={src}
        title={fileName}
        className="w-full h-[75vh] rounded border"
      />
    );
  } else if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
    const officeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      src
    )}`;
    content = (
      <iframe
        src={officeSrc}
        title={fileName}
        className="w-full h-[75vh] rounded border"
      />
    );
  } else if (["mp4", "webm", "ogg"].includes(ext)) {
    content = (
      <video src={src} controls className="w-full h-[75vh] rounded border" />
    );
  } else if (["mp3", "wav", "ogg"].includes(ext)) {
    content = <audio src={src} controls className="w-full" />;
  } else {
    content = (
      <div className="text-muted-foreground text-center py-12">
        <p>Preview not available for this file type.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-1">
          <div className="h-8 w-8 flex items-center justify-center">
            <FileTypeIcon fileName={fileName} fileType={ext} size="small" />
          </div>
          <div className="flex items-center gap-1">{fileName}</div>
        </div>

        <div className="flex items-center justify-center py-4 min-h-60">
          {content}
        </div>
      </div>
    </div>
  );
}
