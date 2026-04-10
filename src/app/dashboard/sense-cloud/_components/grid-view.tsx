"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Eye,
  Star,
  File,
  Copy,
  Share2,
  Trash2,
  Pencil,
  Download,
  Calendar,
  FolderIcon,
  GripVertical,
  MoreHorizontal,
} from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";

import FileTypeIcon from "./file-type-icon";

import type { FileItem } from "../types";

type GridViewProps = {
  files: FileItem[];
  selectedFiles: string[];
  dragOverFolderId: string | null;
  setFilePreview: (file: FileItem | null) => void;
  handleItemDragStart: (e: React.DragEvent, fileId: string) => void;
  handleFolderDragOver: (e: React.DragEvent, folderId: string) => void;
  handleFolderDragLeave: (e: React.DragEvent) => void;
  handleFolderDrop: (e: React.DragEvent, folderId: string) => void;
  handleFolderSelection: (file: FileItem) => void;
  handleFileSelect: (fileId: string) => void;
  handleShare: (file: FileItem) => void;
  cancelShareForObject: (key: string) => void;
  handleStar: (file: FileItem) => void;
  handleMoveSelected: (file: FileItem) => void;
  handleCopySelected: (file: FileItem) => void;
  setSelectedFilesToDelete: React.Dispatch<React.SetStateAction<string[]>>;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDownload: (file: FileItem) => void;
  handleRenameSelected: (file: FileItem) => void;
  formatFileSize: (size?: number | string) => string;
  formatDate: (date: string) => string;
  handleCopyFileName: (fileName: string) => void;
};

const GridView = ({
  files,
  selectedFiles,
  dragOverFolderId,
  setFilePreview,
  handleItemDragStart,
  handleFolderDragOver,
  handleFolderDragLeave,
  handleFolderDrop,
  handleFolderSelection,
  handleFileSelect,
  handleShare,
  cancelShareForObject,
  handleStar,
  handleMoveSelected,
  handleCopySelected,
  setSelectedFilesToDelete,
  setDeleteDialogOpen,
  handleDownload,
  handleRenameSelected,
  formatFileSize,
  formatDate,
  handleCopyFileName,
}: GridViewProps) => {
  const isMobile = useIsMobile();
  const [detailsFile, setDetailsFile] = useState<FileItem | null>(null);

  return (
    <>
      <div
        data-testid="dashboard-sense-cloud-grid-view"
        className="rounded-lg border border-[rgba(37,48,240,0.10)] bg-[rgba(255,255,255,0.30)] dark:bg-[rgba(255,255,255,0.04)] p-4"
      >
        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {(files as FileItem[]).map((file, index) => (
            <div
              key={file.id}
              onDoubleClick={() => {
                if (file.fileType !== "folder") {
                  setFilePreview(file);
                }
              }}
              className={`relative group px-4 rounded-lg border border-border hover:bg-muted/50 transition-colors ${dragOverFolderId === file.id ? "bg-muted ring-2 ring-primary" : ""
                } ${file.fileType === "folder" ? "py-3" : "pt-2 pb-3"}`}
              draggable
              onDragStart={(e) => handleItemDragStart(e, file.id)}
              onDragOver={(e) =>
                file.fileType === "folder"
                  ? handleFolderDragOver(e, file.id)
                  : undefined
              }
              onDragLeave={(e) =>
                file.fileType === "folder" ? handleFolderDragLeave(e) : undefined
              }
              onDrop={(e) =>
                file.fileType === "folder"
                  ? handleFolderDrop(e, file.id)
                  : undefined
              }
            >
          <div
            className={`${file.fileType === "folder"
                ? "h-full flex flex-col justify-between gap-1"
                : "w-full flex items-center gap-1"
              }`}
          >
            {/* drag handle + checkbox */}
            <div
              className={`flex items-center gap-2 ${file.fileType === "folder"
                  ? ""
                  : "flex-shrink-0 mr-2"
                }`}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <Checkbox
                checked={selectedFiles.includes(file.id)}
                onCheckedChange={() => handleFileSelect(file.id)}
              />
            </div>

            {/* preview or icon + filename */}
            {!(isMobile && file.fileType !== "folder") && (
              <div
                {...(file.fileType === "folder" && {
                  title: "Click to open folder",
                })}
                className={`flex items-center ${file.fileType === "folder"
                    ? "flex-col cursor-pointer text-center mb-3"
                    : "gap-2 flex-1 min-w-0"
                  }`}
                onClick={() => {
                  if (file.fileType === "folder") {
                    handleFolderSelection(file);
                  }
                }}
              >
                <div className={`${file.fileType === "folder" && "mb-2"}`}>
                  {file.fileType === "folder" && (
                    <FileTypeIcon
                      index={index}
                      fileName={file.fileName}
                      fileType={file.fileType}
                      size="xlarge"
                    />
                  )}
                </div>
                <div
                  className={`${file.fileType === "folder" ? "w-full" : "flex-1 min-w-0"
                    }`}
                >
                  <div
                    className={`flex items-center justify-center align-middle gap-1 font-medium truncate text-sm ${file.fileType === "folder" ? "" : "min-w-0"
                      }`}
                    title={file.fileName}
                  >
                    <span className="truncate">{file.fileName}</span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Copy file name"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCopyFileName(file.fileName);
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {file.fileType === "folder" && file.size && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(file.size)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* metadata + menu */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {file.fileType === "folder" && formatDate(file.createdAt)}
              <div className="flex items-center gap-1">
                {/* {file.shared && (
                  <Share2 className="h-3.5 w-3.5 text-green-500" />
                )} */}
                {file.starred && (
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                )}
              </div>
            </div>

            <div
              className={`${file.fileType === "folder"
                  ? "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  : ""
                }`}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {file.fileType !== "folder" && (
                    <>
                      <DropdownMenuItem onClick={() => setFilePreview(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      {isMobile && (
                        <DropdownMenuItem onClick={() => setDetailsFile(file)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                      )}
                      {isMobile && (
                        <DropdownMenuItem
                          onClick={() => handleCopyFileName(file.fileName)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Name
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <DropdownMenuItem
                            onClick={() => handleShare(file)}
                            data-testid="storage-share-button"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        </div>
                      </TooltipTrigger>

                      {selectedFiles.length !== 1 && (
                        <TooltipContent side="left">
                          You can only share one file at a time
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  {file.shared && (
                    <DropdownMenuItem
                      onClick={() => cancelShareForObject(file.id)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Cancel Share
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => handleStar(file)}>
                    <Star className="h-4 w-4 mr-2" />
                    {file.starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRenameSelected(file)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {file.fileType !== "folder" && (
                    <DropdownMenuItem onClick={() => handleMoveSelected(file)}>
                      <FolderIcon className="h-4 w-4 mr-2" />
                      Move Selected
                    </DropdownMenuItem>
                  )}
                  {file.fileType !== "folder" && (
                    <DropdownMenuItem onClick={() => handleCopySelected(file)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Selected
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setSelectedFilesToDelete([file.fileName]);
                      setDeleteDialogOpen(true);
                    }}
                    data-testid="storage-delete-selected-button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {!file?.previewUrl ? null : (
            <div className="relative flex items-center justify-center mt-5 w-full h-[76px] overflow-hidden rounded">
              {(() => {
                const ext =
                  file.fileName
                    .split(".")
                    .pop()
                    ?.toLowerCase() || "";
                const src = file.previewUrl;

                if (
                  [
                    "png",
                    "jpg",
                    "jpeg",
                    "gif",
                    "webp",
                  ].includes(ext)
                ) {
                  return (
                    <img
                      src={src}
                      alt={file.fileName}
                      className="w-full h-20 object-contain rounded bg-white dark:bg-background p-1"
                    />
                  );
                } else if (ext === "pdf") {
                  return (
                    <iframe
                      src={src}
                      title={file.fileName}
                      className="size-full rounded"
                    />
                  );
                } else if (
                  [
                    "doc",
                    "docx",
                    "xls",
                    "xlsx",
                    "ppt",
                    "pptx",
                  ].includes(ext)
                ) {
                  const officeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    src
                  )}`;
                  return (
                    <iframe
                      src={officeSrc}
                      title={file.fileName}
                      className="size-full rounded"
                    />
                  );
                } else if (
                  ["mp4", "webm", "ogg"].includes(ext)
                ) {
                  return (
                    <video
                      src={src}
                      controls
                      className="size-full rounded"
                    />
                  );
                } else if (
                  ["mp3", "wav", "ogg"].includes(ext)
                ) {
                  return (
                    <audio
                      src={src}
                      controls
                      className="size-full rounded"
                    />
                  );
                } else {
                  return (
                    <div className="text-muted-foreground size-full flex items-center justify-center rounded">
                      <p>
                        Preview not available for this file type.
                      </p>
                    </div>
                  );
                }
              })()}
              {isMobile && file.fileType !== "folder" && (
                <div className="pointer-events-none absolute inset-x-1 bottom-1 rounded bg-black/60 px-2 py-1 text-[10px] font-medium text-white truncate">
                  {file.fileName}
                </div>
              )}
            </div>
          )}
          {file.fileType !== "folder" && !isMobile && (
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center justify-between text-[#454545] dark:text-[#B9C2D5] pt-3 pb-5">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-[#A801BA] " />
                  <span className=" text-[#454545] dark:text-[#B9C2D5] text-base">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#454545] dark:text-[#B9C2D5]" />
                  <span className=" text-[#454545] dark:text-[#B9C2D5] text-sm">
                    {formatDate(file.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {file.shared ? (
                  <button className="px-4 py-1.5 w-full text-sm font-medium text-green-600 rounded-full bg-green-100">
                    Shared
                  </button>
                ) : (
                  <button className="px-4 py-1.5 w-full text-sm font-medium text-[#F39C12] rounded-full bg-[rgba(243,156,18,0.15)]">
                    Private
                  </button>
                )}
              </div>
            </div>
          )}
            </div>
          ))}
        </div>
      </div>
      <Dialog
        open={Boolean(detailsFile)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsFile(null);
          }
        }}
      >
        <DialogContent className="max-w-[92vw] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
          </DialogHeader>
          {detailsFile && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-right break-all">
                  {detailsFile.fileName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">
                  {formatFileSize(detailsFile.size)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {formatDate(detailsFile.createdAt)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
  </>
  );
};

export default GridView;
