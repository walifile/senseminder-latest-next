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
  file: FileItem | null; // ✅ single file or folder
  selectedFolder: FileItem | null;
  region?: string;
  onDeleteComplete?: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  file,
  selectedFolder,
  region = "virginia",
  onDeleteComplete,
}) => {
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [deleteFile] = useDeleteFileMutation();
  const [isLoading, setIsLoading] = useState(false);

  console.log({ file });

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
      console.error("Error deleting file:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!file) return null;

  const isFolder = file.fileType === "folder";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete {isFolder ? "folder" : "file"} "{file.fileName}"?
          </DialogTitle>
          <DialogDescription>
            This will permanently delete the{" "}
            {isFolder ? "folder and all its contents" : "file"}. Are you sure?
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
