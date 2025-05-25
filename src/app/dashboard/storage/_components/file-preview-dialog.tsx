import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileItem } from "../types";

interface FilePreviewProps {
  file: FileItem | null;
  onClose: () => void;
  handleDownload: (fileName: string) => void;
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
        className="max-h-[75vh] object-contain rounded shadow-md"
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
  } else if (["mp4", "webm", "ogg"].includes(ext)) {
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
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Preview: {file.fileName}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center py-4 min-h-60">
          {content}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => handleDownload(file.fileName)}>
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;
