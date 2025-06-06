import React from "react";
import {
  FileText,
  Folder,
  Image,
  FileVideo2,
  Presentation,
  Table2,
  FileText as FileDocument,
  AudioLines,
  File,
  FileCode2,
  FileJson2,
  Archive,
} from "lucide-react";

const FilledFolderIcon = ({
  className,
  style,
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
  </svg>
);

export const getFileIcon = (fileName: string, type: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  // Folder
  if (type === "folder") return FilledFolderIcon;

  // Document types
  if (extension === "pdf") return File;
  if (extension === "doc" || extension === "docx") return FileDocument;
  if (extension === "xls" || extension === "xlsx") return Table2;
  if (extension === "ppt" || extension === "pptx") return Presentation;
  if (extension === "txt") return FileText;

  // Image types
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || ""))
    return Image;

  // Video types
  if (["mp4", "mov", "avi", "webm"].includes(extension || ""))
    return FileVideo2;

  // Audio types
  if (["mp3", "wav", "ogg", "m4a"].includes(extension || "")) return AudioLines;

  // Code and data types
  if (["json", "xml", "yaml", "yml"].includes(extension || ""))
    return FileJson2;
  if (
    ["js", "ts", "jsx", "tsx", "html", "css", "py", "java"].includes(
      extension || ""
    )
  )
    return FileCode2;

  // Archive types
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension || ""))
    return Archive;

  // Default
  return FileText;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
};

export const formatFileSize = (bytes?: number | string): string => {
  const size = typeof bytes === "string" ? parseInt(bytes) : bytes;

  if (!size || isNaN(size)) return "—";

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  if (gb < 1024) return `${gb.toFixed(2)} GB`;
  const tb = gb / 1024;
  return `${tb.toFixed(2)} TB`;
}

export function getRelativePath(fullPath: string): string {
  return fullPath.split("/").slice(2).join("/");
}
