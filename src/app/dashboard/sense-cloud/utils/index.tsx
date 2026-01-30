import React from "react";

import {
  File,
  Image,
  Table2,
  Archive,
  FileText,
  FileCode2,
  FileJson2,
  FileVideo2,
  AudioLines,
  Presentation,
  FileText as FileDocument,
} from "lucide-react";

import type {
  DuplicateGroup,
  DuplicateItemLike,
  DuplicateScanResponse,
} from "../types";

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
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(0)} MB`;
  const gb = mb / 1024;
  if (gb < 1024) return `${gb.toFixed(0)} GB`;
  const tb = gb / 1024;
  return `${tb.toFixed(0)} TB`;
}

export const getShareStatusMessage = (status?: string) => {
  if (status === "revoked") {
    return "This shared link was revoked by the owner.";
  }
  if (status === "expired") {
    return "This shared link has expired.";
  }
  return "This shared link is no longer available.";
};

export function getRelativePath(fullPath: string): string {
  return fullPath.split("/").slice(2).join("/");
}

// Derive a display folder from item.folder or id.
export const getFolderForItem = (
  item: DuplicateItemLike,
  userId: string
): string => {
  const direct = (item.folder ?? "").trim().replace(/^\/+|\/+$/g, "");

  if (direct) {
    return direct || "/";
  }

  const key = (item.id ?? "").trim();
  if (!key) return "/";

  const userPrefix = `${userId}/`;
  const withoutUser = key.startsWith(userPrefix)
    ? key.slice(userPrefix.length)
    : key;

  const segments = withoutUser.split("/").filter(Boolean);
  if (segments.length <= 1) return "/";

  const folderSegments = segments.slice(0, -1);
  const folderPath = folderSegments.join("/");
  return folderPath || "/";
};

// Build common props for shared file views
export function buildSharedFileView(
  shareId: string,
  name?: string,
  expiresAt?: number
) {
  const fileName = name || "Shared file";
  const ext = (fileName.split(".").pop() || "").toUpperCase();
  const expires = expiresAt
    ? new Date(expiresAt * 1000).toLocaleString()
    : null;
  const downloadUrl = `/api/share/${shareId}?disposition=attachment`;
  const previewUrl = `/api/share/${shareId}?disposition=inline`;
  return { fileName, ext, expires, downloadUrl, previewUrl };
}

// ✅ Build unique key for duplicate group tracking
export const buildDuplicateGroupKey = (group: DuplicateGroup): string =>
  `${group.groupKey.fileName}|${group.groupKey.sizeBytes}|${
    group.groupKey.folder ?? ""
  }`;

// ✅ Format quick stats summary for UI display
export const formatDuplicateStats = (
  stats?: DuplicateScanResponse["stats"]
) => {
  if (!stats) return "—";
  return `${stats.duplicateGroups ?? 0} groups • ${
    stats.duplicateFiles ?? 0
  } duplicates • ${formatFileSize(stats.duplicateBytes ?? 0)} reclaimable`;
};
