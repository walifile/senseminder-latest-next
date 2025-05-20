"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateFolderMutation } from "@/api/fileManagerAPI";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewFolderDialog: React.FC<NewFolderDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [folderName, setFolderName] = useState("");
  const [createFolder, { isLoading }] = useCreateFolderMutation();

  useEffect(() => {
    if (!open) setFolderName("");
  }, [open]);

  const handleCreate = async () => {
    if (!folderName.trim() || !userId) return;

    try {
      await createFolder({
        region: "virginia",
        userId,
        folderName: folderName.trim(),
      }).unwrap();

      toast({
        title: "Folder Created",
        description: `Folder "${folderName}" was created successfully.`,
      });

      onOpenChange(false);
      setFolderName("");
    } catch (err) {
      console.error("Failed to create folder:", err);
      toast({
        title: "Error",
        description: "Could not create the folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || isLoading}
          >
            {isLoading ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewFolderDialog;
