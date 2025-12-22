"use client";

import Image from "next/image";

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
    <div
      data-testid="dashboard-support-attachment-uploader"
      className="self-stretch h-52 relative bg-blue-700/5 hover:bg-blue-700/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-[10px] outline outline-[1.30px] outline-offset-[-1.30px] outline-blue-700/10 dark:outline-white/20 border-[1.3px] border-dashed border-white/20 cursor-pointer transition"
      onClick={() => document.getElementById("ticket-file-upload")?.click()}
    >
      <div className="w-[557px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute inline-flex flex-col justify-center items-center gap-4">
        <div className="w-9 h-9 relative overflow-hidden">
          <Image
            src="/assets/svg/support/upload.svg"
            alt="Upload Icon"
            fill
            priority
          />
        </div>
        <div className="self-stretch flex flex-col justify-start items-center gap-2.5">
          <div className="self-stretch text-center justify-start text-White text-xl font-semibold font-['Inter'] leading-8">
            Upload Files
          </div>
          <div className="self-stretch text-center justify-start text-Paragraph text-base font-normal font-['Inter'] leading-6">
            (Max 2 - PNG/JPEG)
          </div>
        </div>
      </div>
      <input
        id="ticket-file-upload"
        type="file"
        accept="image/png,image/jpeg"
        multiple
        onChange={onUpload}
        className="hidden"
      />
      <div className="flex gap-2 flex-wrap p-2">
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
