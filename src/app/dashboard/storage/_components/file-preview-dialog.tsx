import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";

import { X, Download } from "lucide-react";

import type { FileItem } from "../types";

interface FilePreviewProps {
  file: FileItem | null;
  onClose: () => void;
  handleDownload: (file: FileItem) => void;
}

const FilePreviewDialog: React.FC<FilePreviewProps> = ({
  file,
  onClose,
  handleDownload,
}) => {
  if (!file?.previewUrl) return null;

  const ext = file.fileName.split(".").pop()?.toLowerCase() || "";
  const src = file.previewUrl;

  let content: React.ReactNode = null;

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
    content = (
      <img
        src={src}
        alt={file.fileName}
        className="max-h-[60vh] max-w-[60vw] m-0 p-0 block"
        style={{
          display: "block",
          margin: "0 auto",
          padding: 0,
          border: "none",
          boxShadow: "none",
          background: "none",
        }}
      />
    );
  } else if (ext === "pdf") {
    content = (
      <iframe
        src={src}
        title={file.fileName}
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
        title={file.fileName}
        className="w-full h-[75vh] rounded border"
      />
    );
  } else if (["mp4", "webm", "ogg", "mov", "quicktime"].includes(ext)) {
    content = (
      <video
        src={src}
        controls
        className="max-h-[75vh] object-contain rounded"
      />
    );
  } else if (["mp3", "wav", "ogg"].includes(ext)) {
    content = <audio src={src} controls className="w-full max-w-xl" />;
  } else {
    content = (
      <div className="text-muted-foreground text-center py-12">
        <p>Preview not available for this file type.</p>
      </div>
    );
  }

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent
        className="max-w-fit px-4 py-0 m-0"
        style={{ "--hide-close-button": "none" } as React.CSSProperties}
      >
        <style>{`
          [data-state="open"] > button[data-dialog-close] {
            display: var(--hide-close-button);
          }
        `}</style>

        <DialogHeader>
          <DialogTitle>Preview: {file.fileName}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center p-0 m-0">
          {content}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 text-red-500" />
          </Button>
          <Button onClick={() => handleDownload(file)}>
            <Download className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;
