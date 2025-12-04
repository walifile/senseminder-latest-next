"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Eye,
  FolderIcon,
  GripVertical,
  MoreHorizontal,
  Share2,
  Star,
  Trash2,
} from "lucide-react";

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
  setSelectedFilesToDelete: React.Dispatch<React.SetStateAction<string[]>>;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDownload: (file: FileItem) => void;
  formatFileSize: (size?: number | string) => string;
  formatDate: (date: string) => string;
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
  setSelectedFilesToDelete,
  setDeleteDialogOpen,
  handleDownload,
  formatFileSize,
  formatDate,
}: GridViewProps) => (
  <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
    {(files as FileItem[]).map((file, index) => (
      <div
        key={file.id}
        onDoubleClick={() => {
          if (file.fileType !== "folder") {
            setFilePreview(file);
          }
        }}
        className={`relative group px-4 rounded-lg border border-border hover:bg-muted/50 transition-colors ${
          dragOverFolderId === file.id ? "bg-muted ring-2 ring-primary" : ""
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
          file.fileType === "folder" ? handleFolderDrop(e, file.id) : undefined
        }
      >
        <div
          className={`${
            file.fileType === "folder"
              ? "h-full flex flex-col justify-between gap-1"
              : "w-full flex items-center gap-1"
          }`}
        >
          {/* drag handle + checkbox */}
          <div
            className={`flex items-center gap-2 ${
              file.fileType === "folder"
                ? "absolute top-2 left-2"
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
          <div
            {...(file.fileType === "folder" && {
              title: "Click to open folder",
            })}
            className={`flex items-center ${
              file.fileType === "folder"
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
                  size="large"
                />
              )}
            </div>
            <div
              className={`${
                file.fileType === "folder" ? "w-full" : "flex-1 min-w-0"
              }`}
            >
              <div
                className={`font-medium truncate text-sm ${
                  file.fileType === "folder" ? "" : "min-w-0"
                }`}
                title={file.fileName}
              >
                {file.fileName}
              </div>
              {file.fileType === "folder" && (
                <div className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.size)}
                </div>
              )}
            </div>
          </div>

          {/* metadata + menu */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {file.fileType === "folder" && formatDate(file.createdAt)}
            <div className="flex items-center gap-1">
              {/* {file.shared && (
                                                  <Share2 className="h-3.5 w-3.5 text-green-500" />
                                                )} */}
              {file.starred && <Star className="h-3.5 w-3.5 text-yellow-500" />}
            </div>
          </div>

          <div
            className={`${
              file.fileType === "folder"
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
                  </>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <DropdownMenuItem onClick={() => handleShare(file)}>
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
                <DropdownMenuSeparator />
                {file.fileType !== "folder" && (
                  <DropdownMenuItem onClick={() => handleMoveSelected(file)}>
                    <FolderIcon className="h-4 w-4 mr-2" />
                    Move Selected
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setSelectedFilesToDelete([file.fileName]);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* {!file?.previewUrl ? null : (
                                            <div className="flex items-center justify-center mt-3 w-full h-[76px] overflow-hidden rounded">
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
                                                  [
                                                    "mp4",
                                                    "webm",
                                                    "ogg",
                                                    "mov",
                                                    "quicktime",
                                                  ].includes(ext)
                                                ) {
                                                  return (
                                                    <video
                                                      src={src}
                                                      controls
                                                      className="size-full rounded"
                                                    />
                                                  );
                                                } else if (
                                                  [
                                                    "mp3",
                                                    "wav",
                                                    "ogg",
                                                  ].includes(ext)
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
                                                        Preview not available
                                                        for this file type.
                                                      </p>
                                                    </div>
                                                  );
                                                }
                                              })()}
                                            </div>
                                          )} */}
        {file.fileType != "folder" && (
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
        )}
      </div>
    ))}
  </div>
);

export default GridView;
