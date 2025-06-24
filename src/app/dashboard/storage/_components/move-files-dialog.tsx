"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import {
  useListFilesQuery,
  useListHierarchyQuery,
  useMoveFilesMutation,
} from "@/api/fileManagerAPI";
import { FileItem } from "../types";
import FolderListView from "./folder-list-view";
import { getRelativePath } from "../utils";

type HierarchyFolder = {
  name: string;
  path: string;
  children: HierarchyFolder[];
};

type MoveFilesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFiles: string[];
  setSelectedFiles: (ids: string[]) => void;
  selectedFolder: FileItem | null;
};

const MoveFilesDialog: React.FC<MoveFilesDialogProps> = ({
  open,
  onOpenChange,
  selectedFiles,
  setSelectedFiles,
  selectedFolder,
}) => {
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [moveFiles, { isLoading }] = useMoveFilesMutation();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [path, setPath] = useState<FileItem[]>([]);

  //   const { data, isLoading: isFilesLoading } = useListFilesQuery({
  //   userId,
  //   region: "virginia",
  //   folder: folderPath,
  // });
  const { data, isLoading: isFilesLoading } = useListHierarchyQuery({
    region: "virginia",
    userId,
  });

  const getCurrentLevelFolders = (hierarchyData: { folders: HierarchyFolder[] }, currentPath: FileItem[]): FileItem[] => {
    if (!hierarchyData?.folders) return [];
    
    let currentLevel = hierarchyData.folders;
    
    for (const pathItem of currentPath) {
      const foundFolder = currentLevel.find(folder => folder.name === pathItem.fileName);
      if (foundFolder && foundFolder.children) {
        currentLevel = foundFolder.children;
      } else {
        return [];
      }
    }
    
    return currentLevel.map(folder => ({
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

  const handleMove = async () => {
    console.log("🚀 ~ selectedFolderId:", selectedFolderId);
    console.log("🚀 ~ selectedFiles:", selectedFiles);
    console.log("🚀 ~ userId:", userId);

    if (!selectedFolderId) {
      console.error("❌ No destination folder selected");
      toast({
        title: "Move Failed",
        description: "Please select a destination folder",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      console.error("❌ No userId available");
      toast({
        title: "Move Failed", 
        description: "User authentication required",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      console.error("❌ No files selected");
      toast({
        title: "Move Failed",
        description: "No files selected to move",
        variant: "destructive",
      });
      return;
    }

    try {
      // Debug the path transformations
      const sourceFileNames = selectedFiles.map((id) => {
        const relativePath = getRelativePath(id);
        console.log(`🚀 ~ Source file: ${id} → ${relativePath}`);
        return relativePath;
      });

      const destinationFolder = getRelativePath(selectedFolderId);
      console.log(`🚀 ~ Destination folder: ${selectedFolderId} → ${destinationFolder}`);

      // Check if getRelativePath is working correctly
      if (sourceFileNames.some(name => !name || name.trim() === '')) {
        console.error("❌ Some source file names are empty after getRelativePath");
        throw new Error("Invalid source file paths");
      }

      if (!destinationFolder || destinationFolder.trim() === '') {
        console.error("❌ Destination folder is empty after getRelativePath");
        throw new Error("Invalid destination folder path");
      }

      const movePayload = {
        region: "virginia",
        userId,
        sourceFileNames,
        destinationFolder,
      };

      console.log("🚀 ~ Move API payload:", movePayload);

      const result = await moveFiles(movePayload).unwrap();
      
      console.log("✅ ~ Move operation successful:", result);

      toast({
        title: "Move Complete",
        description: `${sourceFileNames.length} item(s) moved to "${destinationFolder}"`,
      });

      setSelectedFiles([]);
      closeDialog();

    } catch (err: any) {
      console.error("❌ ~ Move operation failed:", err);
      
      // More detailed error handling
      let errorMessage = "Could not move selected items. Please try again.";
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      console.error("❌ ~ Error details:", {
        status: err?.status,
        data: err?.data,
        message: err?.message,
        originalError: err?.originalError,
      });

      toast({
        title: "Move Failed",
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

  // Enhanced validation logic with logging
  const selectedFolderExists = selectedFiles?.some((id) => {
    const exists = id === selectedFolderId;
    if (exists) {
      console.log("⚠️ ~ Trying to move folder into itself:", id);
    }
    return exists;
  });

  const isSameAsCurrentFolder = selectedFolder?.id === selectedFolderId;
  if (isSameAsCurrentFolder) {
    console.log("⚠️ ~ Trying to move to the same folder:", selectedFolder?.id);
  }

  const canMove = selectedFolderId && 
                  !selectedFolderExists && 
                  !isSameAsCurrentFolder && 
                  selectedFiles.length > 0 && 
                  userId && 
                  !isLoading;

  console.log("🚀 ~ Move button enabled:", canMove, {
    selectedFolderId: !!selectedFolderId,
    selectedFolderExists,
    isSameAsCurrentFolder,
    hasSelectedFiles: selectedFiles.length > 0,
    hasUserId: !!userId,
    isNotLoading: !isLoading,
  });

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move {selectedFiles.length} file(s)</DialogTitle>
          <DialogDescription>
            Select a destination folder to move the selected files
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
          <Button
            onClick={handleMove}
            disabled={!canMove}
          >
            {isLoading ? "Moving..." : "Move Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveFilesDialog;