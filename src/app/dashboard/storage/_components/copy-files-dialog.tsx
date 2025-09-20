import type { RootState } from "@/redux/store";

import React, { useMemo, useState } from "react";
import {
  useCopyFilesMutation,
  useListHierarchyQuery,
} from "@/api/fileManagerAPI";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";

import { useToast } from "@/hooks/use-toast";

import { getRelativePath } from "../utils";
import FolderListView from "./folder-list-view";

import type { FileItem } from "../types";

type HierarchyFolder = {
  name: string;
  path: string;
  children: HierarchyFolder[];
};

type CopyFilesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFiles: string[];
  setSelectedFiles: (ids: string[]) => void;
  selectedFolder: FileItem | null;
};

const CopyFilesDialog: React.FC<CopyFilesDialogProps> = ({
  open,
  onOpenChange,
  selectedFiles,
  setSelectedFiles,
  selectedFolder,
}) => {
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [copyFiles, { isLoading }] = useCopyFilesMutation();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [path, setPath] = useState<FileItem[]>([]);

  // const { data, isLoading: isFilesLoading } = useListFilesQuery({
  //   userId,
  //   region: "virginia",
  //   folder: folderPath,
  // });

  // Derive folderPath from the current path state
  const folderPath =
    path.length > 0 ? path.map((item) => item.fileName).join("/") : "";

  const { data, isLoading: isFilesLoading } = useListHierarchyQuery({
    region: "virginia",
    userId,
    folder: folderPath,
  });

  const getCurrentLevelFolders = (
    hierarchyData: { folders: HierarchyFolder[] },
    currentPath: FileItem[]
  ): FileItem[] => {
    if (!hierarchyData?.folders) return [];

    let currentLevel = hierarchyData.folders;

    for (const pathItem of currentPath) {
      const foundFolder = currentLevel.find(
        (folder) => folder.name === pathItem.fileName
      );
      if (foundFolder?.children) {
        currentLevel = foundFolder.children;
      } else {
        return [];
      }
    }

    return currentLevel.map((folder) => ({
      id: folder.path,
      fileName: folder.name,
      fileType: "folder" as const,
      createdAt: new Date().toISOString(),
      size: "0",
      lastModified: new Date().toISOString(),
    }));
  };

  const folders = useMemo(() => {
    if (!data) return [];
    return getCurrentLevelFolders(data, path);
  }, [data, path]);

  const handleCopy = async () => {
    if (!selectedFolderId || !userId || selectedFiles.length === 0) return;

    const sourceFileNames = selectedFiles.map((id) => {
      const relPath = getRelativePath(id);
      return relPath;
    });

    const destinationFolder = getRelativePath(selectedFolderId);
    // console.log(`🚀 ~ Destination: ${selectedFolderId} → ${destinationFolder}`);

    if (
      sourceFileNames.some((name) => !name?.trim()) ||
      !destinationFolder?.trim()
    ) {
      console.error("Invalid paths in copy");
      toast({
        title: "Copy Failed",
        description: "Invalid file or folder path(s)",
        variant: "destructive",
      });
      return;
    }

    try {
      await copyFiles({
        region: "virginia",
        userId,
        sourceFileNames,
        destinationFolder,
      }).unwrap();

      toast({
        title: "Items Copied",
        description: `${selectedFiles.length} item(s) copied to "${destinationFolder}"`,
      });

      setSelectedFiles([]);
      closeDialog();
    } catch (error) {
      const err = error as { data?: { message?: string }; message?: string };
      let errorMessage = "Could not copy items. Please try again.";

      if (err?.data?.message) errorMessage = err.data.message;
      else if (err?.message) errorMessage = err.message;
      else if (typeof err === "string") errorMessage = err;

      toast({
        title: "Copy Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const closeDialog = () => {
    setPath([]);
    setSelectedFolderId(null);
    onOpenChange(false);
  };

  const selectedFolderExists = selectedFiles?.some((id) => {
    const exists = id === selectedFolderId;
    if (exists) {
      // console.log("⚠️ ~ Trying to copy into itself:", id);
    }
    return exists;
  });

  const isSameAsCurrentFolder = selectedFolder?.id === selectedFolderId;
  if (isSameAsCurrentFolder) {
    // console.log(" ~ Copying to same folder:", selectedFolder?.id);
  }

  const canCopy =
    selectedFolderId &&
    !selectedFolderExists &&
    !isSameAsCurrentFolder &&
    selectedFiles.length > 0 &&
    userId &&
    !isLoading;

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Copy {selectedFiles.length} file(s)</DialogTitle>
          <DialogDescription>
            Select a destination folder to copy the selected files
          </DialogDescription>
        </DialogHeader>

        <FolderListView
          folders={folders}
          isLoading={isFilesLoading}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          path={path}
          setPath={setPath}
          selectedFolder={selectedFolder}
          selectedFiles={selectedFiles}
        />

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button onClick={handleCopy} disabled={!canCopy}>
            {isLoading ? "Copying..." : "Copy Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyFilesDialog;
