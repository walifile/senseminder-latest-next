"use client";

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
import { Copy, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { useShareFilesMutation } from "@/api/fileManagerAPI";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FileItem } from "../types";

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileItem[];
  selectedFiles: string[];
  selectedFolder: FileItem | null;
};

const BulkShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  files,
  selectedFiles,
  selectedFolder,
}) => {
  const { toast } = useToast();

  const [sharePermissions, setSharePermissions] = useState<"view" | "edit">(
    "view"
  );
  const [shareExpiry, setShareExpiry] = useState<string>("7days");
  const [sharePasswordEnabled, setSharePasswordEnabled] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [shareLink, setShareLink] = useState("");

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [shareFiles, { isLoading }] = useShareFilesMutation();

  useEffect(() => {
    if (!open) {
      setShareLink("");
      setSharePermissions("view");
      setShareExpiry("7days");
      setSharePassword("");
      setSharePasswordEnabled(false);
    }
  }, [open]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link Copied",
      description: "The share link has been copied to your clipboard.",
    });
  };

  const handleShare = async () => {
    if (!userId) return;

    try {
      const result = await shareFiles({
        region: "virginia",
        userId,
        items: files.map((file) => file.fileName),
        ...(selectedFolder && { folder: selectedFolder.fileName }),
        permissions: sharePermissions,
        expiry: shareExpiry,
        ...(sharePasswordEnabled && { password: sharePassword }),
      }).unwrap();

      setShareLink(result.shareLink);

      toast({
        title: `Items Shared`,
        description: `Your selected items have been shared successfully`,
      });
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share Failed",
        description: "Could not share. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Selected</DialogTitle>
          <DialogDescription>
            Create a link to share these items with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {shareLink && (
            <div className="flex items-center gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label>Link expires</Label>
            <Select value={shareExpiry} onValueChange={setShareExpiry}>
              <SelectTrigger>
                <SelectValue placeholder="Select expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">1 day</SelectItem>
                <SelectItem value="7days">7 days</SelectItem>
                <SelectItem value="30days">30 days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={handleShare}>
            {isLoading ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkShareDialog;
