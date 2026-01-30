// src/app/dashboard/sense-cloud/_components/upload-dialog.tsx
// (or wherever your UploadDialog lives)

"use client";

import type { RootState } from "@/redux/store";

import React, { useRef, useState } from "react";
import { FEEDBACK_TRIGGERS } from "@/constants/app-constants";
// import { Progress } from "@/components/ui/progress";
import {
  useUploadFileMutation,
  useUploadCompleteMutation,
  useUploadToPresignedUrlMutation,
} from "@/api/fileManagerAPI";
import {
  STORAGE_REGIONS,
  type StorageRegion,
  getStorageRegionLabel,
  type StorageRegionOption,
} from "@/constants/storage-regions";

import { Logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";

import { X, Check, Upload, Trash2, Loader2 } from "lucide-react";

import { useFeedback } from "@/hooks/use-feedback";
import { useToast } from "@/hooks/use-toast";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderPath?: string;
  prefillFiles?: File[];
  prefillToken?: number;
  region: StorageRegion;
  regions?: StorageRegionOption[];
  isRegionLocked?: boolean;
  onRegionChange?: (region: StorageRegion) => void;
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onOpenChange,
  folderPath,
  prefillFiles,
  prefillToken,
  region,
  regions,
  isRegionLocked = false,
  onRegionChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, "loading" | "success" | "error">
  >({});
  const [isDragging, setIsDragging] = useState(false);

  const [uploadFile] = useUploadFileMutation();
  const [uploadComplete] = useUploadCompleteMutation();
  const [uploadToPresignedUrl] = useUploadToPresignedUrlMutation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { triggerFeedback } = useFeedback();
  const { toast } = useToast();

  const isUploading = Object.values(uploadStatus).includes("loading");
  const regionOptions = regions?.length ? regions : STORAGE_REGIONS;
  const regionLabel = getStorageRegionLabel(region, regionOptions);

  const appendFiles = (incoming: File[] | FileList | null) => {
    if (!incoming) return;
    const fileArray = Array.from(incoming);

    const updatedFiles: File[] = [];

    fileArray.forEach((file) => {
      let finalName = file.name;
      const baseName = file.name.replace(/(\.\w+)$/, "");
      const ext = file.name.match(/(\.\w+)$/)?.[0] || "";

      let counter = 1;

      // Only modify name if already selected
      while (
        selectedFiles.some((f) => f.name === finalName) ||
        updatedFiles.some((f) => f.name === finalName)
      ) {
        finalName = `${baseName} (${counter})${ext}`;
        counter++;
      }

      const renamedFile =
        finalName === file.name
          ? file
          : new File([file], finalName, { type: file.type });
      updatedFiles.push(renamedFile);
    });

    setSelectedFiles((prev) => [...prev, ...updatedFiles]);
  };

  const handleFileChange = (files: FileList | null) => {
    appendFiles(files);
  };

  const handleFileRemove = (index: number) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  const handleUpload = async () => {
    const newStatus = { ...uploadStatus };
    selectedFiles.forEach((file) => (newStatus[file.name] = "loading"));
    setUploadStatus(newStatus);

    const results = await Promise.all(
      selectedFiles.map(async (file) => {
        try {
          const { uploadUrl, finalFileName, key } = await uploadFile({
            fileName: file.name,
            fileType: file.type,
            userId: user?.id,
            region,
            size: file.size.toString(),
            status: "private",
            starred: false,
            folder: folderPath,
          }).unwrap();

          await uploadToPresignedUrl({ uploadUrl, file }).unwrap();
          await uploadComplete({
            fileName: finalFileName || file.name,
            fileType: file.type,
            userId: user?.id,
            region,
            size: file.size.toString(),
            status: "private",
            starred: false,
            folder: folderPath,
            key,
          }).unwrap();

          setUploadStatus((prev) => ({ ...prev, [file.name]: "success" }));

          void triggerFeedback({
            trigger: FEEDBACK_TRIGGERS.PC_ACTION,
            delayMinutes: 0,
          });

          return { file, status: "success" as const };
        } catch (err) {
          Logger.error(err);
          setUploadStatus((prev) => ({ ...prev, [file.name]: "error" }));
          return { file, status: "error" as const };
        }
      })
    );

    const successCount = results.filter((result) => result.status === "success")
      .length;
    const errorCount = results.length - successCount;

    if (successCount > 0 && errorCount === 0) {
      toast({
        title: "Upload complete",
        description: `${successCount} file${
          successCount === 1 ? "" : "s"
        } uploaded successfully.`,
      });
      closeDialog();
    } else if (successCount > 0 && errorCount > 0) {
      toast({
        title: "Upload completed with errors",
        description: `${successCount} file${
          successCount === 1 ? "" : "s"
        } uploaded, ${errorCount} failed.`,
        variant: "destructive",
      });
    } else if (errorCount > 0) {
      toast({
        title: "Upload failed",
        description: "No files were uploaded. Please try again.",
        variant: "destructive",
      });
    }

    // ✅ DO NOT close dialog after upload.
    // Let the user review results and close manually.
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    appendFiles(event.dataTransfer.files);
  };

  const closeDialog = () => {
    // ✅ Don’t close the dialog mid-upload
    if (isUploading) return;

    setSelectedFiles([]);
    setUploadStatus({});
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (prefillFiles && prefillFiles.length && prefillToken !== undefined) {
      appendFiles(prefillFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillToken]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // ✅ Only run our close logic when dialog is being closed
        if (!nextOpen) closeDialog();
        // If opening, do nothing special
      }}
    >
      <DialogContent
        data-testid="storage-upload-modal"
        className="sm:max-w-[425px]"
        // ✅ Prevent accidental close while uploading
        onEscapeKeyDown={(e) => {
          if (isUploading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isUploading) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isUploading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Choose files from your device to upload
            {folderPath ? ` to the folder "${folderPath}"` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="region"
              className="block self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8"
            >
              Select Region
            </label>
            <Select
              value={region}
              onValueChange={(value) =>
                onRegionChange?.(value as StorageRegion)
              }
              disabled={isRegionLocked || !onRegionChange}
            >
              <SelectTrigger
                className="w-full h-auto px-5 py-4 text-paragraph text-base font-normal font-['Inter'] leading-6"
                data-testid="storage-region-dropdown"
              >
                <SelectValue placeholder={regionLabel} />
              </SelectTrigger>
              <SelectContent>
                {regionOptions.map((regionOption) => (
                  <SelectItem
                    key={regionOption.value}
                    value={regionOption.value}
                  >
                    {regionOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File upload zone */}
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full px-10 py-11 h-auto border-[1.3px] border-dashed rounded-lg cursor-pointer transition bg-[rgba(37,48,240,0.07)] hover:bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.04)] hover:dark:bg-[rgba(255,255,255,0.04)] border-[rgba(37,48,240,0.10)] dark:border-[rgba(255,255,255,0.20)] ${
              isDragging ? "border-primary bg-gray-100" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 mb-2 text-[#454545] dark:text-muted-foreground" />
              <p className="text-[#020816] dark:text-white mb-2 text-sm">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-[#454545] dark:text-[#B9C2D5]">
                Any file type
              </p>
            </div>

            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              ref={fileInputRef}
              onChange={(e) => {
                handleFileChange(e.target.files);
                e.target.value = "";
              }}
              data-testid="storage-file-input"
            />
          </label>

          {/* File list */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between bg-muted px-4 py-2 rounded-lg text-sm"
                >
                  {file?.name?.length > 10 ? (
                    <span className="truncate w-40" title={file?.name}>
                      {`${file?.name.slice(0, 6)}...${file?.name?.slice(
                        file?.name?.lastIndexOf(".")
                      )}`}
                    </span>
                  ) : (
                    <span className="truncate w-40">{file.name}</span>
                  )}

                  <div className="flex items-center gap-2">
                    {uploadStatus[file.name] === "loading" && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {uploadStatus[file.name] === "success" && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    {uploadStatus[file.name] === "error" && (
                      <X className="w-4 h-4 text-red-500" />
                    )}

                    {!uploadStatus[file.name] && (
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        disabled={isUploading}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={
              selectedFiles.length === 0 ||
              Object.values(uploadStatus).includes("loading")
            }
            className="w-full"
            data-testid="storage-upload-files-button"
          >
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>

          {/* Optional: manual close button (keeps behavior explicit) */}
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            disabled={isUploading}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
