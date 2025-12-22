import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";

import { X, Loader2, Download } from "lucide-react";

import type { FileItem } from "../types";

interface FilePreviewProps {
  file: FileItem | null;
  onClose: () => void;
  handleDownload: (file: FileItem) => void;
  isDownloading?: boolean;
}

const FilePreviewDialog: React.FC<FilePreviewProps> = ({
  file,
  onClose,
  handleDownload,
  isDownloading = false,
}) => {
  if (!file?.previewUrl) return null;

  const ext = file.fileName.split(".").pop()?.toLowerCase() || "";
  const src = file.previewUrl;

  let content: React.ReactNode = null;

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
    content = (
      <div className="w-full max-w-4xl">
        <img
          src={src}
          alt={file.fileName}
          className="max-h-[60vh] max-w-full object-contain mx-auto block rounded-lg"
        />
      </div>
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
        className="max-h-[65vh] w-full h-full object-contain rounded-lg bg-black"
      />
    );
  } else if (["mp3", "wav", "ogg"].includes(ext)) {
    content = (
      <div className="w-full max-w-2xl">
        <audio src={src} controls className="w-full" />
      </div>
    );
  } else {
    content = (
      <div className="text-muted-foreground text-center py-12 text-sm">
        <p>Preview not available for this file type.</p>
      </div>
    );
  }

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent
        data-testid="dashboard-sense-cloud-file-preview-dialog"
        className="w-[90vw] max-w-5xl border-none bg-background/95 p-6 rounded-3xl shadow-2xl"
      >
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg font-semibold text-foreground">
            File preview
          </DialogTitle>
          <p className="text-sm text-muted-foreground truncate">
            {file.fileName}
          </p>
        </DialogHeader>

        <div className="mt-4 bg-black/90 rounded-2xl p-4 flex items-center justify-center min-h-[40vh] max-h-[70vh] overflow-hidden">
          {content}
        </div>

        <DialogFooter className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-muted-foreground truncate">
            {file.fileName}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="gap-2 text-sm"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
            <Button
              onClick={() => handleDownload(file)}
              className="gap-2"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;
