"use client";

import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Send, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Message } from "../types";
import { sanitizeFilename } from "@/lib/utils/index";
import api from "@/api/apiConfig";
import {
  useGetTicketMessagesQuery,
  usePresignTicketUploadMutation,
  useSendTicketMessageMutation,
  useUpdateTicketStatusMutation,
} from "@/api/supportAPI";

interface Props {
  ticketId: string;
  userId: string;
  isClosed: boolean;
  ticketStatus: string;
  senderType?: "customer" | "agent";
  onReplySent?: () => void;
}

const MAX_FILES = 2;
const MAX_SIZE_MB = 3;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

const TicketConversation: React.FC<Props> = ({
  ticketId,
  userId,
  isClosed,
  ticketStatus,
  senderType = "customer",
}) => {
  const { toast } = useToast();

  const [presignUpload] = usePresignTicketUploadMutation();
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
  const [attachments, setAttachments] = useState<File[]>([]);
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
  const uploadAttachment = async (file: File) => {
    if (!userId) return null;
    try {
      const sanitized = sanitizeFilename(file.name);
      const meta = {
        fileName: sanitized,
        fileType: file.type,
        fileSize: file.size,
      };

      // const res = await fetchWithUserId(
      //   `${API_BASE}/ticket/${ticketId}/presign-upload`,
      //   {
      //     method: "POST",
      //     userId,
      //     body: meta,
      //   }
      // );

      // const { uploadUrl, fileKey } = await res.json();

      const { uploadUrl, fileKey } = await presignUpload({
        userId,
        id: ticketId,
        body: meta,
      }).unwrap();

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
      toast({ title: `Upload failed for ${file.name}` });
      return null;
    }
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const merged: File[] = [];

    for (const file of newFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: `Invalid file type: ${file.name}` });
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast({ title: `File too large: ${file.name}` });
        continue;
      }
      if (attachments.length + merged.length >= MAX_FILES) break;
      merged.push(file);
    }
    setAttachments((prev) => [...prev, ...merged]);
  };

  const removeAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d");
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
          const localDate = new Date(msg.timestamp);
          const formattedTime = format(localDate, "p");
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
                      {formattedTime}
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
                onChange={handleFileChange}
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
