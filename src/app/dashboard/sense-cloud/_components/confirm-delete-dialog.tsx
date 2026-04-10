import type { RootState } from "@/redux/store";

import { useState } from "react";
import { useDeleteFileMutation } from "@/api/fileManagerAPI";
import { type StorageRegion, DEFAULT_STORAGE_REGION } from "@/constants/storage-regions";

import { Logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";

import type { FileItem } from "../types";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null; // ✅ single file or folder
  selectedFolder: FileItem | null;
  region?: StorageRegion;
  onDeleteComplete?: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  file,
  selectedFolder,
  region = DEFAULT_STORAGE_REGION,
  onDeleteComplete,
}) => {
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [deleteFile] = useDeleteFileMutation();
  const [isLoading, setIsLoading] = useState(false);

  Logger.log({ file });

  const handleFileDelete = async () => {
    if (!file || !userId) return;
    setIsLoading(true);
    try {
      await deleteFile({
        fileName: file.fileName,
        userId,
        region,
        folder: selectedFolder?.fileName || "",
        key: file.id,
      }).unwrap();

      if (onDeleteComplete) onDeleteComplete();
      onClose();
    } catch (err) {
      Logger.error("Error deleting file:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!file) return null;

  const isFolder = file.fileType === "folder";

      return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-testid="dashboard-sense-cloud-confirm-delete-dialog"
        closeClassName="right-3 top-3 sm:right-4 sm:top-4"
        closeIconClassName="h-4 w-4 sm:h-7 sm:w-7"
      >
        <DialogHeader className="pr-10 sm:pr-0">
          <DialogTitle className="text-center leading-tight sm:text-left">
            <span className="break-words">
              Delete {isFolder ? "folder" : "file"}{" "}
              <span className="break-all">"{file.fileName}"</span>?
            </span>
          </DialogTitle>
          <DialogDescription>
            This will permanently delete the{" "}
            {isFolder ? "folder and all its contents" : "file"}. Are you sure?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleFileDelete}
            disabled={isLoading}
            data-testid="storage-confirm-delete-button"
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
