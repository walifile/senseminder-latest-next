import {
  usePresignTicketUploadMutation,
  usePresignTicketUpload2Mutation,
} from "@/api/supportAPI";

import { useToast } from "@/components/ui/use-toast";
import { sanitizeFilename } from "@/lib/utils/index";

export const useUploadAttachment = (
  userId: string | undefined,
  ticketId?: string
) => {
  const { toast } = useToast();
  const [presignUpload] = usePresignTicketUploadMutation();
  const [presignUpload2] = usePresignTicketUpload2Mutation();

  const uploadAttachment = async (file: File) => {
    if (!userId) {
      return null;
    }

    try {
      const sanitized = sanitizeFilename(file.name);
      const meta = {
        fileName: sanitized,
        fileType: file.type,
        fileSize: file.size,
      };

      const { uploadUrl, fileKey } = ticketId
        ? await presignUpload({ userId, ticketId, body: meta }).unwrap()
        : await presignUpload2({ userId, body: meta }).unwrap();

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      return {
        name: sanitized,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type,
        fileKey,
      };
    } catch (err) {
      console.error("Upload failed:", err);
      toast({ title: `Upload failed for ${file.name}` });
      return null;
    }
  };

  return { uploadAttachment };
};
