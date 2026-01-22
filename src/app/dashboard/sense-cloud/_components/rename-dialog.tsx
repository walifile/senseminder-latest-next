"use client";

import type { RootState } from "@/redux/store";
import type { StorageRegion } from "@/constants/storage-regions";

import React, { useState, useEffect } from "react";
import { useRenameItemMutation } from "@/api/fileManagerAPI";

import { Logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils";
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

import type { FileItem } from "../types";

type RenameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileItem | null;
  onRenamed?: (payload: { oldKey: string; newKey: string; newName: string }) => void;
  region: StorageRegion;
};

const RenameDialog: React.FC<RenameDialogProps> = ({
  open,
  onOpenChange,
  file,
  onRenamed,
  region,
}) => {
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [renameItem, { isLoading }] = useRenameItemMutation();
  const [newName, setNewName] = useState("");
  const [fileExt, setFileExt] = useState("");

  useEffect(() => {
    if (open && file) {
      const parts = file.fileName.split(".");
      if (file.fileType !== "folder" && parts.length > 1) {
        const ext = `.${parts.pop()}`;
        setFileExt(ext);
        setNewName(parts.join("."));
      } else {
        setFileExt("");
        setNewName(file.fileName);
      }
    }
    if (!open) {
      setNewName("");
      setFileExt("");
    }
  }, [open, file]);

  const handleRename = async () => {
    if (!file || !userId) return;
    const trimmed = newName.trim();
    if (!trimmed) return;
    const finalName = file.fileType !== "folder" ? `${trimmed}${fileExt}` : trimmed;

    try {
      const result = await renameItem({
        region,
        userId,
        key: file.id,
        newName: finalName,
      }).unwrap();

      const newKey = result?.newKey || file.id;
      const resolvedName = result?.newName || finalName;

      toast({
        title: "Renamed",
        description: `"${file.fileName}" renamed to "${resolvedName}".`,
      });

      onRenamed?.({ oldKey: file.id, newKey, newName: resolvedName });
      onOpenChange(false);
    } catch (error) {
      Logger.error("Rename failed:", error);
      toast({
        title: "Rename Failed",
        description: getErrorMessage(error, "Could not rename. Please try again."),
        variant: "destructive",
      });
    }
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="dashboard-sense-cloud-rename-dialog"
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription>
            Enter a new name for this {file.fileType === "folder" ? "folder" : "file"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rename-name">Name</Label>
          <div className="flex items-center gap-2">
            <Input
              id="rename-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            {fileExt && (
              <span className="text-sm text-muted-foreground">{fileExt}</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={!newName.trim() || isLoading}>
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog;
