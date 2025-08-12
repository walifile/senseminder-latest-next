"use client";

import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Send, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "../types";
import {
  useGetTicketMessagesQuery,
  useSendTicketMessageMutation,
  useUpdateTicketStatusMutation,
} from "@/api/supportAPI";
import { useFileValidation } from "../hooks/use-file-validation";
import { useUploadAttachment } from "../hooks/use-upload-attachment";
import { formatDateLabel, formatTimeLabel } from "@/lib/utils/format-time";

interface Props {
  ticketId: string;
  userId: string;
  isClosed: boolean;
  ticketStatus: string;
  senderType?: "customer" | "agent";
  onReplySent?: () => void;
}

const TicketConversation: React.FC<Props> = ({
  ticketId,
  userId,
  isClosed,
  ticketStatus,
  senderType = "customer",
}) => {
  const { toast } = useToast();

  const [sendMessage, { isLoading: isSending }] =
    useSendTicketMessageMutation();

  const { data: messagesData = [], isLoading: isMsgsLoading } =
    useGetTicketMessagesQuery(
      { userId, id: ticketId },
      { skip: !userId || !ticketId }
    );
  const [updateStatus] = useUpdateTicketStatusMutation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const { attachments, setAttachments, onFileChange, removeAttachment } =
    useFileValidation();
  const { uploadAttachment } = useUploadAttachment(userId, ticketId);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(messagesData || []);
  }, [messagesData]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    try {
      const uploaded = await Promise.all(attachments.map(uploadAttachment));
      // await fetchWithUserId(`${API_BASE}/ticket/${ticketId}/message`, {
      //   method: "POST",
      //   userId,
      //   body: {
      //     senderId: userId,
      //     senderType,
      //     type: "message",
      //     content: reply,
      //     attachments: uploaded,
      //   },
      // });

      await sendMessage({
        userId,
        id: ticketId,
        body: {
          senderId: userId,
          senderType,
          type: "message",
          content: reply,
          attachments: uploaded,
        },
      }).unwrap();

      if (ticketStatus === "resolved") {
        // await fetchWithUserId(`${API_BASE}/ticket/${ticketId}/status`, {
        //   method: "PATCH",
        //   userId,
        //   body: { status: "in-progress" },
        // });

        await updateStatus({
          userId,
          id: ticketId,
          status: "in-progress",
        }).unwrap();
      }

      setReply("");
      setAttachments([]);

      toast({ title: "Reply sent" });
    } catch {
      toast({ title: "Failed to send reply", variant: "destructive" });
    }
  };

  let lastDate = "";

  return (
    <div className="space-y-6 w-full">
      {/* Message Thread */}
      <div
        ref={containerRef}
        className="space-y-4 max-h-[500px] overflow-y-auto"
      >
        {messages.map((msg) => {
          const msgDate = msg.timestamp.split("T")[0];
          const showDateDivider = msgDate !== lastDate;
          lastDate = msgDate;

          return (
            <React.Fragment key={msg.messageId}>
              {showDateDivider && (
                <div className="text-center text-xs text-muted-foreground py-2">
                  {formatDateLabel(msg.timestamp)}
                </div>
              )}
              {/* <div
                className={`w-full flex items-start gap-3 p-4 rounded-lg border shadow-sm ${
                  msg.senderType === "agent" ? "bg-muted/50" : "bg-white"
                }`}
              > */}
              <div
                className={`flex items-start gap-3 p-4 rounded border shadow-sm w-full ${
                  msg.senderType === "agent"
                    ? "bg-muted/50"
                    : "bg-white text-black dark:bg-[#0f1e1b]/50 dark:text-white dark:backdrop-blur-sm dark:ring-1 dark:ring-white/10"
                }`}
              >
                <Avatar className="h-9 w-9 bg-muted">
                  <AvatarFallback>
                    {msg.senderName?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-semibold">
                      {msg.senderName || "Me"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeLabel(msg.timestamp)}
                    </div>
                  </div>
                  <div className="mt-1 text-base whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {Array.isArray(msg.attachments) &&
                    msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <FileText className="h-4 w-4" />
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Reply Form */}
      {isClosed ? (
        <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground border">
          This ticket is closed. If you need further assistance, please open a
          new ticket.
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reply to Support</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              {ticketStatus === "resolved" && (
                <div className="bg-yellow-100 text-yellow-800 text-sm p-3 rounded">
                  This ticket has been marked as resolved. Your reply will
                  reopen it.
                </div>
              )}

              <Textarea
                placeholder="Type your reply here..."
                className="min-h-[120px]"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />

              <input
                id="upload"
                type="file"
                accept=".png,.jpeg"
                multiple
                onChange={onFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("upload")?.click()}
              >
                Upload files
              </Button>

              <div className="flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="text-sm border rounded px-2 py-1 flex gap-2 items-center"
                  >
                    {file.name}
                    <Trash
                      className="h-4 w-4 text-red-500 cursor-pointer"
                      onClick={() => removeAttachment(idx)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!reply.trim()}>
                  <Send className="h-4 w-4 mr-1" />
                  Send Reply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketConversation;
