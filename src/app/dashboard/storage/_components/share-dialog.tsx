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
import { useShareFileMutation } from "@/api/fileManagerAPI";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FileItem } from "../types";

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file?: FileItem | null;
  selectedFolder: FileItem | null;
};

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  file,
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
  const [shareFile, { isLoading }] = useShareFileMutation();

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
    if (!file || !userId) return;

    const isFolder = file.fileType === "folder";

    try {
      const result = await shareFile({
        region: "virginia",
        userId,
        ...(file.id && { key: file.id }),
        ...(file.fileName && !file.id && { fileName: file.fileName }),
        ...(selectedFolder && { folder: selectedFolder.fileName }),
        permissions: sharePermissions,
        expiry: shareExpiry,
        ...(sharePasswordEnabled && { password: sharePassword }),
      }).unwrap();

      let link = result.shareLink;

      // Make absolute URL if not already
      if (!/^https?:\/\//i.test(link)) {
        const origin = window.location.origin;
        link = `${origin}${link.startsWith("/") ? "" : "/"}${link}`;
      }

      setShareLink(link);

      toast({
        title: `${isFolder ? "Folder" : "File"} Shared`,
        description: `Your ${
          isFolder ? "folder and its contents" : "file"
        } have been shared successfully.`,
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
          <DialogTitle>Share {file?.fileName}</DialogTitle>
          <DialogDescription>
            {file?.fileType === "folder"
              ? "Create a link to share this folder and all its contents"
              : "Create a link to share this file with others"}
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
              {file?.fileType !== "folder" && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch(shareLink);
                      const blob = await response.blob();
                      const blobUrl = window.URL.createObjectURL(blob);

                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = file?.fileName || "download";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(blobUrl);
                    } catch (error) {
                      console.error("Download failed:", error);
                      toast({
                        title: "Download Error",
                        description:
                          "Could not download the file. Try again later.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          )}
          {/* <div className="space-y-2">
            <Label>Permissions</Label>
            <RadioGroup
              value={sharePermissions}
              onValueChange={(value: "view" | "edit") =>
                setSharePermissions(value)
              }
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="view" id="view" />
                <Label htmlFor="view">View only</Label>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <RadioGroupItem value="edit" id="edit" />
                <Label htmlFor="edit">Can edit</Label>
              </div>
            </RadioGroup>
          </div> */}

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

          {/* <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password protection</Label>
              <Switch
                id="password"
                checked={sharePasswordEnabled}
                onCheckedChange={setSharePasswordEnabled}
              />
            </div>
            {sharePasswordEnabled && (
              <Input
                placeholder="Enter password"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
              />
            )}
          </div> */}

          {/* <div className="space-y-2">
            <Label>Share with specific people</Label>
            <div className="flex items-center gap-2">
              <Input placeholder="Enter email addresses" />
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div> */}
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

export default ShareDialog;
