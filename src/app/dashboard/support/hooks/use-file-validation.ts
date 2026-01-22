import { useState } from "react";

import { useToast } from "@/components/ui/use-toast";

import { MAX_FILES, ALLOWED_TYPES, MAX_FILE_SIZE_MB } from "../constants";

export function useFileValidation() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<File[]>([]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: `Invalid file type: ${file.name}` });
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({ title: `File too large: ${file.name}` });
        continue;
      }
      if (attachments.length + validFiles.length >= MAX_FILES) {
        toast({ title: `Only ${MAX_FILES} attachments allowed.` });
        break;
      }
      validFiles.push(file);
    }

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    attachments,
    setAttachments,
    onFileChange,
    removeAttachment,
  };
}
