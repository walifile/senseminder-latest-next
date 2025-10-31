"use client";

import type { RootState } from "@/redux/store";

import React, { useState, useEffect } from "react";
import {
  useShareFileMutation,
  useCancelShareMutation,
} from "@/api/fileManagerAPI";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";

import { Copy, Download } from "lucide-react";
import appConfig from "@/config/app-config";

// import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

import type { FileItem } from "../types";

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
  const [shareId, setShareId] = useState<string | null>(null);

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [shareFile, { isLoading }] = useShareFileMutation();
  const [cancelShare, { isLoading: isCancelling }] = useCancelShareMutation();

  useEffect(() => {
    if (!open) {
      setShareLink("");
      setShareId(null);
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

      // capture shareId for cancellable shares (files and folders)
      if (result?.id) {
        try {
          setShareId(String(result.id));
        } catch {}
      }

      // Prefer a friendly front-end link for file shares: {origin}/share/{id}
      if (shareId && isFolder === false && typeof window !== "undefined") {
        link = `${window.location.origin}/shared-file/${shareId}`;
      } else if (!/^https?:\/\//i.test(link)) {
        // Fallback: build absolute URL for other cases
        const base =
          typeof window !== "undefined" ? window.location.origin : "";
        link = base ? `${base}${link.startsWith("/") ? "" : "/"}${link}` : link;
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

  const handleCancelShare = async () => {
    if (!shareId) return;
    try {
      await cancelShare({ shareId }).unwrap();
      setShareId(null);
      setShareLink("");
      toast({
        title: "Share Cancelled",
        description: "The share link can no longer be used.",
      });
    } catch (error) {
      console.error("Cancel share failed:", error);
      toast({
        title: "Cancel Failed",
        description: "Could not cancel the share. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Share {file?.fileName}
          </DialogTitle>
          <DialogDescription>
            {file?.fileType === "folder"
              ? "Create a link to share this folder and all its contents"
              : "Create a link to share this file with others"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {shareLink && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {/* Link icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M13.5 6.75a.75.75 0 0 1 0 1.5H8.25a2.25 2.25 0 0 0 0 4.5h2a.75.75 0 0 1 0 1.5h-2a3.75 3.75 0 0 1 0-7.5H13.5Zm2.25 3a.75.75 0 0 1 0-1.5h2a3.75 3.75 0 0 1 0 7.5H10.5a.75.75 0 0 1 0-1.5h7.25a2.25 2.25 0 0 0 0-4.5h-2Z" />
                </svg>
                Share link
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1 min-w-[60%] font-mono text-xs"
                />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                {file?.fileType !== "folder" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch(shareLink);
                        const blob = await response.blob();
                        const blobUrl = window.URL.createObjectURL(blob);

                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = file?.fileName || "download";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
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
                {shareId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelShare}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Share"}
                  </Button>
                )}
              </div>
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
            {isLoading ? (
              "Sharing..."
            ) : (
              <span className="inline-flex items-center gap-2">
                {/* Share icon */}
                Share
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
