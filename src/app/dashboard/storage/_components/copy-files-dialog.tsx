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
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useCopyFilesMutation, useListFilesQuery } from "@/api/fileManagerAPI";
import { FileItem } from "../types";
import FolderListView from "./folder-list-view";
import { getRelativePath } from "../utils";

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
  const folderPath = path.map((f) => f.fileName).join("/");

  const { data, isLoading: isFilesLoading } = useListFilesQuery({
    userId,
    region: "virginia",
    folder: folderPath,
  });

  const folders = data?.files.filter(
    (file: FileItem) => file.fileType === "folder"
  );

  const handleCopy = async () => {
    if (!selectedFolderId) return;

    const sourceFileNames = selectedFiles.map((id) => getRelativePath(id));

    const destinationFolder = getRelativePath(selectedFolderId);

    try {
      await copyFiles({
        region: "virginia",
        userId,
        sourceFileNames,
        destinationFolder,
      }).unwrap();

      toast({
        title: "Items Copied",
        description: `${selectedFiles.length} item(s) copied successfully`,
      });

      setSelectedFiles([]);
      closeDialog();
    } catch (err) {
      console.error("Copy failed", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy items. Please try again.",
        variant: "destructive",
      });
    }
  };

  const closeDialog = () => {
    setPath([]);
    setSelectedFolderId(null);
    onOpenChange(false);
  };

  const selectedFolderExists = selectedFiles?.some(
    (id) => id === selectedFolderId
  );

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
          <Button
            onClick={handleCopy}
            disabled={
              !selectedFolderId ||
              selectedFolderExists ||
              selectedFolder?.id === selectedFolderId ||
              selectedFiles.length === 0 ||
              !userId ||
              isLoading
            }
          >
            {isLoading ? "Copying..." : "Copy Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyFilesDialog;
