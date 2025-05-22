"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useListFilesQuery, useMoveFilesMutation } from "@/api/fileManagerAPI";
import { FileItem } from "../types";

type MoveFilesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files?: Array<{
    id: string;
    name?: string;
    type?: string;
    [key: string]: unknown;
  }>;
  selectedFiles: string[];
  setSelectedFiles: (ids: string[]) => void;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
};

const MoveFilesDialog: React.FC<MoveFilesDialogProps> = ({
  open,
  onOpenChange,
  files,
  selectedFiles,
  setSelectedFiles,
  selectedFolderId,
  setSelectedFolderId,
}) => {
  const { toast } = useToast();

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [moveFiles, { isLoading }] = useMoveFilesMutation();

  const handleMove = async () => {
    if (!selectedFolderId || !userId) return;

    const selectedFolders = files?.filter(
      file => selectedFiles.includes(file.id) && file.fileType === "folder"
    );

    if (selectedFolders?.length) {
      toast({
        title: "Invalid Selection",
        description: "Only files will be moved. Folders will be skipped.",
        variant: "destructive",
      });
    }

    try {
      const sourceFileNames =
        files &&
        files
          .filter(
            file =>
              selectedFiles.includes(file.id) && file.fileType !== "folder"
          )
          .map(file => file.fileName);

      const destinationFolder = files?.find(
        file => file.id === selectedFolderId
      )?.fileName;

      await moveFiles({
        region: "virginia",
        userId,
        sourceFileNames,
        destinationFolder,
      }).unwrap();
      if (sourceFileNames) {
        toast({
          title: "Files Moved",
          description: `${sourceFileNames.length} file(s) moved to "${selectedFolderId}"`,
        });
      }

      setSelectedFiles([]);
      setSelectedFolderId(null);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Move Failed",
        description: "Could not move files. Please try again.",
        variant: "destructive",
      });
      console.error("Move error:", err);
    }
  };
  console.log({ selectedFiles });
  const { data, isLoading: isFilesLoading } = useListFilesQuery({
    userId,
    region: "virginia",
    type: "folder",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move {selectedFiles.length} file(s)</DialogTitle>
          <DialogDescription>
            Select a destination folder to move the selected files
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            {isFilesLoading && <p>Loading folders...</p>}
            {!isFilesLoading && data?.files?.length === 0 && (
              <p>No folders found.</p>
            )}
            {!isFilesLoading &&
              data?.files?.map((folder: FileItem) => (
                <div
                  key={folder.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
                    selectedFolderId === folder.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <Folder className="h-4 w-4" />
                  <span>{folder.fileName}</span>
                </div>
              ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
