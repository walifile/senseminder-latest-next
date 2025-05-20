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
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useCopyFilesMutation } from "@/api/fileManagerAPI";

interface CopyFilesDialogProps {
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
}

const CopyFilesDialog: React.FC<CopyFilesDialogProps> = ({
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
  const [copyFiles, { isLoading }] = useCopyFilesMutation();

  const handleCopy = async () => {
    const destinationFolder =
      files && files.find((f) => f.id === selectedFolderId)?.name;
    if (!userId || !destinationFolder) return;

    const sourceFileNames =
      files &&
      files
        .filter((file) => selectedFiles.includes(file.id))
        .map((file) => file.name || "");

    try {
      await copyFiles({
        region: "virginia",
        userId,
        sourceFileNames,
        destinationFolder,
      }).unwrap();

      toast({
        title: "Files Copied",
        description: `${selectedFiles.length} file(s) copied successfully`,
      });

      setSelectedFiles([]);
      setSelectedFolderId(null);
      onOpenChange(false);
    } catch (err) {
      console.error("Copy failed", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy files. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Copy {selectedFiles.length} file(s)</DialogTitle>
          <DialogDescription>
            Select a destination folder to copy the selected files
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            {files &&
              files
                .filter((file) => file.type === "folder")
                .map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
                      selectedFolderId === folder.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <Folder className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={
              !selectedFolderId || selectedFiles.length === 0 || isLoading
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
