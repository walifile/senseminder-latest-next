"use client";

import React, { useState } from "react";
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
import { useListFilesQuery, useMoveFilesMutation } from "@/api/fileManagerAPI";
import { FileItem } from "../types";
import FolderListView from "./folder-list-view";
import { getRelativePath } from "../utils";

type MoveFilesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFiles: string[];
  setSelectedFiles: (ids: string[]) => void;
};

const MoveFilesDialog: React.FC<MoveFilesDialogProps> = ({
  open,
  onOpenChange,
  selectedFiles,
  setSelectedFiles,
}) => {
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [moveFiles, { isLoading }] = useMoveFilesMutation();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [path, setPath] = useState<FileItem[]>([]);
  const folderPath = path.map((f) => f.fileName).join("/");

  const { data, isLoading: isFilesLoading } = useListFilesQuery({
    userId,
    region: "virginia",
    folder: folderPath,
  });

  const folders = data?.files.filter(
    (file: FileItem) => file.fileType === "folder"
  );

  const handleMove = async () => {
    if (!selectedFolderId || !userId) return;

    try {
      const sourceFileNames = selectedFiles.map((id) => getRelativePath(id));

      const destinationFolder = getRelativePath(selectedFolderId);

      await moveFiles({
        region: "virginia",
        userId,
        sourceFileNames,
        destinationFolder,
      }).unwrap();

      toast({
        title: "Move Complete",
        description: `${sourceFileNames.length} item(s) moved to "${destinationFolder}"`,
      });

      setSelectedFiles([]);
      closeDialog();
    } catch (err) {
      toast({
        title: "Move Failed",
        description: "Could not move selected items. Please try again.",
        variant: "destructive",
      });
      console.error("Move error:", err);
    }
  };

  const closeDialog = () => {
    setPath([]);
    setSelectedFolderId(null);
    onOpenChange(false);
  };

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
        />

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={
              !selectedFolderId || selectedFiles.length === 0 || isLoading
            }
          >
            {isLoading ? "Moving..." : "Move Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveFilesDialog;
