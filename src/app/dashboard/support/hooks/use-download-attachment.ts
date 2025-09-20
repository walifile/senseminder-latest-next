import { usePresignTicketDownloadMutation } from "@/api/supportAPI";

import { getErrorMessage } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export const useDownloadAttachment = (userId: string, ticketId: string) => {
  const { toast } = useToast();
  const [presignDownload] = usePresignTicketDownloadMutation();

  const downloadAttachment = async (fileKey: string, fileName: string) => {
    try {
      const { downloadUrl } = await presignDownload({
        userId,
        ticketId,
        fileKey,
      }).unwrap();

      if (!downloadUrl) throw new Error("Missing download URL");

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast({
        title: "Download failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return { downloadAttachment };
};
