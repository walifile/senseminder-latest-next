import { useDeleteFileMutation } from "@/api/fileManagerAPI";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { FileItem } from "../types";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  fileNames: string[];
  selectedFolder: FileItem | null;
  region?: string;
  onDeleteComplete?: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  fileNames,
  selectedFolder,
  region = "virginia",
  onDeleteComplete,
}) => {
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [deleteFile] = useDeleteFileMutation();
  const [isLoading, setIsLoading] = useState(false);

  const isMultiDelete = fileNames.length > 1;

  const handleFileDelete = async () => {
    if (fileNames.length === 0 || !userId) return;
    setIsLoading(true);
    try {
      for (const fileName of fileNames) {
        await deleteFile({
          fileName,
          userId,
          region,
          folder: selectedFolder?.fileName || "",
        }).unwrap();
      }
      if (onDeleteComplete) onDeleteComplete();
      onClose();
    } catch (err) {
      console.error("Error deleting file(s):", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (fileNames.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isMultiDelete
              ? `Delete ${fileNames.length} files?`
              : "Delete file?"}
          </DialogTitle>
          <DialogDescription>
            {isMultiDelete
              ? "This will permanently delete all selected files. Are you sure?"
              : `Are you sure you want to delete "${fileNames[0]}"? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleFileDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
