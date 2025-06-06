"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Check, X, Loader2, Trash2 } from "lucide-react";
// import { Progress } from "@/components/ui/progress";
import {
  useUploadFileMutation,
  useUploadToPresignedUrlMutation,
  useListFilesQuery,
} from "@/api/fileManagerAPI";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FileItem {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  shared?: boolean;
  starred?: boolean;
  sharedWith?: string;
  size?: string;
  type?: string;
}

const UploadDialog: React.FC<UploadDialogProps> = ({ open, onOpenChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [region, setRegion] = useState("north-virginia");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, "loading" | "success" | "error">
  >({});
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");

  const [uploadFile] = useUploadFileMutation();
  const [uploadToPresignedUrl] = useUploadToPresignedUrlMutation();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: storedFiles } = useListFilesQuery(
    {
      userId: user?.id,
      region: "virginia",
    },
    { skip: !user?.id }
  );
  useEffect(() => {
    if (storedFiles && storedFiles?.files.length > 0) {
      setUploadedFiles(
        new Set(storedFiles?.files.map((file: FileItem) => file.fileName))
      );
    }
  }, [storedFiles]);

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);

    const newFiles = fileArray.filter(
      (file) =>
        !selectedFiles.some((f) => f.name === file.name) &&
        !uploadedFiles.has(file.name)
    );

    if (newFiles.length === 0) {
      setDuplicateError("These files have already been selected or uploaded.");
      return;
    }

    setDuplicateError("");
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index: number) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  const handleUpload = async () => {
    const filesToUpload = selectedFiles.filter(
      (file) => !uploadedFiles.has(file.name)
    );
    const newStatus = { ...uploadStatus };
    filesToUpload.forEach((file) => (newStatus[file.name] = "loading"));
    setUploadStatus(newStatus);

    await Promise.all(
      filesToUpload.map(async (file) => {
        try {
          const { uploadUrl } = await uploadFile({
            fileName: file.name,
            fileType: file.type,
            userId: user?.id,
            region: "virginia",
            size: file.size.toString(),
            status: "private",
            starred: false,
          }).unwrap();

          await uploadToPresignedUrl({ uploadUrl, file }).unwrap();
          setUploadStatus((prev) => ({ ...prev, [file.name]: "success" }));
          setUploadedFiles((prev) => new Set(prev).add(file.name));
          setSelectedFiles([]);
          onOpenChange(false);
        } catch (err) {
          console.error(err);
          setUploadStatus((prev) => ({ ...prev, [file.name]: "error" }));
        }
      })
    );
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Select files from your computer to upload
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="region"
              className="block text-sm font-medium text-muted-foreground"
            >
              Select Region
            </label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full h-10 text-sm bg-muted border border-input rounded-md focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north-virginia">North Virginia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File upload zone */}
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition bg-muted/50 hover:bg-muted ${
              isDragging ? "border-primary bg-gray-100" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Any file type up to 10MB
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files)}
            />
          </label>

          {/* Duplicate error message */}
          {duplicateError && (
            <p className="text-red-500 text-sm">{duplicateError}</p>
          )}

          {/* File list */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between bg-muted px-3 py-2 rounded text-sm"
                >
                  <span className="truncate w-40">{file.name}</span>
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
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload progress */}
          {/* {Object.values(uploadStatus).includes("loading") && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>
                  {Math.round(
                    (Object.values(uploadStatus).filter((s) => s === "success")
                      .length /
                      Object.keys(uploadStatus).length) *
                      100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={Math.round(
                  (Object.values(uploadStatus).filter((s) => s === "success")
                    .length /
                    Object.keys(uploadStatus).length) *
                    100
                )}
                className="h-2"
              />
            </div>
          )} */}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={
              selectedFiles.length === 0 ||
              Object.values(uploadStatus).includes("loading")
            }
            className="w-full py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 transition"
          >
            Upload Files
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
