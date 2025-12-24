"use client";

import React from "react";

import { Folder, ChevronRight } from "lucide-react";

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
  const handleOpenFolder = (folder: FileItem) => {
    setPath((prev) => [...prev, folder]);
  };

  return (
    <div data-testid="dashboard-sense-cloud-folder-list" className="py-4">
      <div className="space-y-2">
        {isLoading && <p>Loading folders...</p>}

        {!isLoading && folders.length === 0 && <p>No folders found.</p>}

        {!isLoading && rootId && (
          <div
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
              selectedFolderId === rootId ? "bg-muted" : ""
            }`}
            onClick={() => {
              if (selectedFolder?.id !== rootId) {
                setSelectedFolderId(rootId);
              } else {
                setSelectedFolderId(null);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span>{rootLabel}</span>
            </div>
          </div>
        )}

        {!isLoading &&
          folders.map((folder: FileItem) => (
            <div
              key={folder.id}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
                selectedFolderId === folder.id ? "bg-muted" : ""
              }`}
              onClick={() => {
                if (
                  selectedFolder?.id !== folder.id &&
                  selectedFiles?.some((id) => id !== folder.id)
                ) {
                  setSelectedFolderId(folder.id);
                } else {
                  setSelectedFolderId(null);
                }
              }}
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
          ))}
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
