"use client";

import React from "react";
import { ChevronRight, Folder } from "lucide-react";
import { FileItem } from "../types";
import FolderHierarchy from "./folder-hierarchy";

type FolderListViewProps = {
  folders: FileItem[];
  isLoading: boolean;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  path: FileItem[];
  setPath: React.Dispatch<React.SetStateAction<FileItem[]>>;
  selectedFolder: FileItem | null;
};

const FolderListView: React.FC<FolderListViewProps> = ({
  folders,
  isLoading,
  selectedFolderId,
  setSelectedFolderId,
  path,
  setPath,
  selectedFolder,
}) => {
  const handleOpenFolder = (folder: FileItem) => {
    setPath((prev) => [...prev, folder]);
  };

  return (
    <div className="py-4">
      <div className="space-y-2">
        {isLoading && <p>Loading folders...</p>}

        {!isLoading && folders.length === 0 && <p>No folders found.</p>}

        {!isLoading &&
          folders.map((folder: FileItem) => (
            <div
              key={folder.id}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
                selectedFolderId === folder.id ? "bg-muted" : ""
              }`}
              onClick={() => {
                if (selectedFolder?.id !== folder.id) {
                  setSelectedFolderId(folder.id);
                  console.log("check1");
                } else {
                  setSelectedFolderId(null);
                  console.log("check2");
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
