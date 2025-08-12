import { usePresignTicketUploadMutation } from "@/api/supportAPI";
import { useToast } from "@/components/ui/use-toast";
import { sanitizeFilename } from "@/lib/utils/index";

export const useUploadAttachment = (
  userId: string | undefined,
  ticketId?: string
) => {
  const { toast } = useToast();
  const [presignUpload] = usePresignTicketUploadMutation();

  const uploadAttachment = async (file: File) => {
    if (!userId) return null;

    try {
      const sanitized = sanitizeFilename(file.name);
      const meta = {
        fileName: sanitized,
        fileType: file.type,
        fileSize: file.size,
      };

      const params: any = { userId, body: meta };
      if (ticketId) params.id = ticketId;

      const { uploadUrl, fileKey } = await presignUpload(params).unwrap();

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
    } catch {
      toast({ title: `Upload failed for ${file.name}` });
      return null;
    }
  };

  return { uploadAttachment };
};
