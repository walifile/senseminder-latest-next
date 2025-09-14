"use client";

import { sanitizeFilename } from "@/lib/utils/index";

import { X } from "lucide-react";

interface Props {
  files: File[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

export default function AttachmentUploader({
  files,
  onUpload,
  onRemove,
}: Props) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">
        Attachments (Max 2 - PNG/JPEG)
      </label>
      <label
        htmlFor="ticket-file-upload"
        className="inline-flex items-center px-3 py-1.5 bg-muted text-sm border rounded cursor-pointer hover:bg-muted/70 transition"
      >
        Upload Files
      </label>
      <input
        id="ticket-file-upload"
        type="file"
        accept="image/png,image/jpeg"
        multiple
        onChange={onUpload}
        className="hidden"
      />
      <div className="mt-2 flex gap-2 flex-wrap">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 text-sm border p-1 rounded"
          >
            <span className="truncate max-w-[120px]">
              {sanitizeFilename(file.name)}
            </span>
            <button type="button" onClick={() => onRemove(idx)}>
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
