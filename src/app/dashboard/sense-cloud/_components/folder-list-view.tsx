"use client";

import React from "react";

import { Folder, ChevronRight } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import FolderHierarchy from "./folder-hierarchy";

import type { FileItem } from "../types";

type FolderListViewProps = {
  folders: FileItem[];
  isLoading: boolean;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  path: FileItem[];
  setPath: React.Dispatch<React.SetStateAction<FileItem[]>>;
  selectedFolder: FileItem | null;
  selectedFiles: string[];
  rootId?: string | null;
  rootLabel?: string;
};

const FolderListView: React.FC<FolderListViewProps> = ({
  folders,
  isLoading,
  selectedFolderId,
  setSelectedFolderId,
  path,
  setPath,
  selectedFolder,
  selectedFiles,
  rootId,
  rootLabel = "Root",
}) => {
  const normalizeFolderId = (id: string) => (id.endsWith("/") ? id : `${id}/`);
  const getParentFolderId = (id: string) => {
    const trimmed = id.endsWith("/") ? id.slice(0, -1) : id;
    const idx = trimmed.lastIndexOf("/");
    return idx >= 0 ? trimmed.slice(0, idx + 1) : "";
  };

  const isInvalidDestination = (folderId: string) => {
    if (!selectedFiles.length) {
      return false;
    }
    const normalized = normalizeFolderId(folderId);
    return selectedFiles.every(
      (id) => normalizeFolderId(getParentFolderId(id)) === normalized
    );
  };

  const handleOpenFolder = (folder: FileItem) => {
    setPath((prev) => [...prev, folder]);
  };

  return (
    <div data-testid="dashboard-sense-cloud-folder-list" className="py-4">
      <div className="space-y-2">
        {isLoading && <p>Loading folders...</p>}

        {!isLoading && folders.length === 0 && <p>No folders found.</p>}

        {!isLoading && rootId && (() => {
          const isDisabled = isInvalidDestination(rootId);
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`group flex items-center justify-between p-2 rounded-lg ${
                      isDisabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:bg-muted/50"
                    } ${selectedFolderId === rootId ? "bg-muted" : ""}`}
                    onClick={() => {
                      if (isDisabled) return;
                      if (selectedFolder?.id !== rootId) {
                        setSelectedFolderId(rootId);
                      } else {
                        setSelectedFolderId(null);
                      }
                    }}
                    aria-disabled={isDisabled}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      <span>{rootLabel}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                {isDisabled && (
                  <TooltipContent side="top" align="center" sideOffset={6}>
                    Already in this folder
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })()}

        {!isLoading &&
          folders.map((folder: FileItem) => {
            const isDisabled = isInvalidDestination(folder.id);
            return (
              <TooltipProvider key={folder.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`group flex items-center justify-between p-2 rounded-lg ${
                        isDisabled
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:bg-muted/50"
                      } ${selectedFolderId === folder.id ? "bg-muted" : ""}`}
                      onClick={() => {
                        if (isDisabled) return;
                        if (selectedFolder?.id !== folder.id) {
                          setSelectedFolderId(folder.id);
                        } else {
                          setSelectedFolderId(null);
                        }
                      }}
                      aria-disabled={isDisabled}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        <span>{folder.fileName}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenFolder(folder)}
                        className="hidden group-hover:block p-1 bg-muted text-primary rounded-full hover:bg-primary/10 transition"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  {isDisabled && (
                    <TooltipContent side="top" align="center" sideOffset={6}>
                      Already in this folder
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
      </div>

      <FolderHierarchy
        path={path}
        setPath={setPath}
        setSelectedFolderId={setSelectedFolderId}
      />
    </div>
  );
};

export default FolderListView;
