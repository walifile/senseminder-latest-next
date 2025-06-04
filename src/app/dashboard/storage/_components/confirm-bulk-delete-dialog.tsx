import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  selectedFiles: string[];
  onDeleteSelected: () => void;
}

const ConfirmBulkDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  isLoading,
  selectedFiles,
  onDeleteSelected,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Selected</DialogTitle>
          <DialogDescription>
            This will permanently delete the {selectedFiles.length} selected
            item{selectedFiles.length > 1 ? "s" : ""}. Are you sure?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDeleteSelected}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmBulkDeleteDialog;
