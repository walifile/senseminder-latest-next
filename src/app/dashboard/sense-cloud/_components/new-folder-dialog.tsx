"use client";

import type { RootState } from "@/redux/store";

import React, { useState, useEffect } from "react";
import { useCreateFolderMutation } from "@/api/fileManagerAPI";

import { Logger } from "@/lib/utils/logger";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";

import { useToast } from "@/hooks/use-toast";

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderPath: string;
}

const NewFolderDialog: React.FC<NewFolderDialogProps> = ({
  open,
  onOpenChange,
  folderPath,
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

    const trimmedName = folderName.trim();
    if (!trimmedName || !userId) return;

    const fullFolderPath = folderPath
      ? `${folderPath.replace(/\/+$/, "")}/${trimmedName}`
      : trimmedName;

    try {
      await createFolder({
        region: "virginia",
        userId,
        folderName: fullFolderPath,
      }).unwrap();

      toast({
        title: "Folder Created",
        description: `Folder "${folderName}" was created successfully.`,
      });

      onOpenChange(false);
      setFolderName("");
    } catch (err) {
      Logger.error("Failed to create folder:", err);
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
            {folderPath ? ` located in "${folderPath}"` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="folder-name" className="self-stretch justify-start text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">Folder Name</Label>
          <Input
            id="folder-name"
            placeholder="Enter your folder name"
            value={folderName}
            className="justify-start h-auto border-0 outline outline-1 outline-offset-[-1px] outline-white/20 px-5 py-4 bg-white/5 rounded-[10px] text-paragraph text-base font-normal placeholder:font-normal font-['Inter'] leading-6"
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" className="w-full text-center text-white text-base font-medium font-['Inter'] leading-6" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="w-full text-center text-white text-base font-medium font-['Inter'] leading-6"
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
