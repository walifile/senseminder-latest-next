import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileItem } from "../types";

type FolderHierarchyProps = {
  path: FileItem[];
  setPath: (path: FileItem[]) => void;
  setSelectedFolderId: (id: string | null) => void;
};

const FolderHierarchy: React.FC<FolderHierarchyProps> = ({
  path,
  setPath,
  setSelectedFolderId,
}) => {
  if (path.length === 0) return;

  const handleSwitchFolder = (file: FileItem) => {
    setSelectedFolderId(file.id);
    const index = path.findIndex((f) => f.id === file.id);
    if (index !== -1) {
      setPath(path.slice(0, index + 1));
    }
  };

  const StoragePath = (
    <div className="flex items-center gap-2 py-2">
      <span
        className="hover:underline cursor-pointer"
        onClick={() => {
          setPath([]);
          setSelectedFolderId(null);
        }}
      >
        Storage
      </span>
      <ChevronRight className="h-4 w-4" />
    </div>
  );

  return (
    <div className="mt-5 flex items-center gap-2">
      {path.length <= 2 ? (
        <>
          {StoragePath}

          {path.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-2 py-2">
              <span
                className={`${
                  path.length - 1 !== index && "hover:underline cursor-pointer"
                }`}
                onClick={() => {
                  if (path.length - 1 !== index) {
                    handleSwitchFolder(folder);
                  }
                }}
              >
                {folder.fileName}
              </span>
              {index < path.length - 1 && <ChevronRight className="h-4 w-4" />}
            </div>
          ))}
        </>
      ) : (
        <>
          {StoragePath}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-1 hover:bg-gray-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-40">
              {path.slice(0, -2).map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => handleSwitchFolder(folder)}
                  className="cursor-pointer"
                >
                  <span className="truncate">{folder.fileName}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ChevronRight className="h-4 w-4" />

          <div className="flex items-center gap-2 py-2">
            <span
              className="hover:underline cursor-pointer"
              onClick={() => handleSwitchFolder(path[path.length - 2])}
            >
              {path[path.length - 2].fileName}
            </span>
            <ChevronRight className="h-4 w-4" />
          </div>

          <span>{path[path.length - 1].fileName}</span>
        </>
      )}
    </div>
  );
};

export default FolderHierarchy;
