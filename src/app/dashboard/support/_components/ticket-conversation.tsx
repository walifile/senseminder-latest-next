"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  useGetTicketMessagesQuery,
  useSendTicketMessageMutation,
} from "@/api/supportAPI";

import { Logger } from "@/lib/utils/logger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { filterNonNullable } from "@/lib/utils/index";
import { Separator } from "@/components/ui/separator";
import { formatDateLabel, formatTimeLabel } from "@/lib/utils/format-time";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

import { Send, Trash, FileText, Download } from "lucide-react";

import { useFileValidation } from "../hooks/use-file-validation";
import { useUploadAttachment } from "../hooks/use-upload-attachment";
import { useDownloadAttachment } from "../hooks/use-download-attachment";

import type { Message } from "../types";

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
  onReplySent,
}) => {
  const { toast } = useToast();

  const [sendMessage, { isLoading: isSending }] =
    useSendTicketMessageMutation();

  const { data: messagesData = [] } = useGetTicketMessagesQuery(
    { userId, id: ticketId },
    { skip: !userId || !ticketId }
  );

  const messages = (messagesData || []) as Message[];
  const [reply, setReply] = useState("");

  const { attachments, setAttachments, onFileChange, removeAttachment } =
    useFileValidation();

  const { uploadAttachment } = useUploadAttachment(userId, ticketId);
  const { downloadAttachment } = useDownloadAttachment(userId, ticketId);

  const containerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   setMessages(messagesData || []);
  // }, [messagesData]);
  useEffect(() => {
    if (messagesData?.length) {
      // show the newest one (or [0] depending on your sort)
      console.log("sample msg.timestamp =", messagesData[0]?.timestamp);
    }
  }, [messagesData]);  

  // useEffect(() => {
  //   containerRef.current?.scrollTo({
  //     top: containerRef.current.scrollHeight,
  //     behavior: "smooth",
  //   });
  // }, [messages]);
  useEffect(() => {
    // scroll when new messages arrive
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages.length]);  

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    try {
      const uploaded = await Promise.all(attachments.map(uploadAttachment));
      const validUploads = filterNonNullable(uploaded);

      await sendMessage({
        userId,
        id: ticketId,
        body: {
          senderId: userId,
          senderType,
          type: "message",
          content: reply,
          attachments: validUploads,
        },
      }).unwrap();

      setReply("");
      setAttachments([]);
      toast({ title: "Reply sent" });
      onReplySent?.();
    } catch (err) {
      toast({ title: "Failed to send reply", variant: "destructive" });
      Logger.error("Reply failed:", err);
    }
  };

  return (
    <div
      data-testid="dashboard-support-ticket-conversation"
      className="space-y-6 w-full"
    >
      {/* Thread Header (email/case-style) */}
        <div className="rounded-[10px] border border-blue-700/10 dark:border-white/15 bg-blue-700/5 dark:bg-white/5 shadow-none">
          <div className="px-4 py-3 bg-transparent rounded-t-[10px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground font-['Inter']">
                Support case
              </div>
              <div className="text-lg font-semibold font-['Space_Grotesk'] leading-8 truncate">
                Ticket #{ticketId}
              </div>
              {/* <div className="text-xs text-muted-foreground mt-1">
                Messages are displayed in an email-style log for easy review and
                auditing.
              </div> */}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {isClosed ? "Closed" : "Open"}
              </Badge>
            </div>
          </div>
        </div>
        <Separator />

        {/* Message Log */}
        <div
          ref={containerRef}
          className="max-h-[500px] overflow-y-auto px-4 py-4 space-y-4"
        >
          {messages.map((msg, idx) => {
            const msgDate = msg.timestamp.split("T")[0];
            const prevDate =
              idx > 0 ? messages[idx - 1].timestamp.split("T")[0] : "";
            const showDateDivider = msgDate !== prevDate;

            const isAgent = msg.senderType === "agent";
            const fromName = msg.senderName || (isAgent ? "Support Team" : "You");
            const toName = isAgent ? "You" : "Support Team";
            const sentLabel = `${formatDateLabel(msg.timestamp)} • ${formatTimeLabel(
              msg.timestamp
            )}`;

            return (
              <React.Fragment key={msg.messageId}>
                {showDateDivider && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-border" />
                    <div className="text-xs text-muted-foreground whitespace-nowrap font-['Inter']">
                      {formatDateLabel(msg.timestamp)}
                    </div>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                <Card
                  className={[
                    "shadow-none",
                    "border",
                    "border-l-4",
                    "rounded-[10px]",
                    "border-blue-700/10 dark:border-white/15",
                    isAgent
                      ? "bg-emerald-500/5 dark:bg-emerald-400/10 border-l-emerald-500/40"
                      : "bg-blue-700/[0.035] dark:bg-white/4 border-l-blue-700/35",
                  ].join(" ")}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-semibold font-['Space_Grotesk'] leading-8 truncate">
                          {isAgent ? "Response from Support" : "User reply"}
                        </CardTitle>
                        <div className="text-sm mt-1 font-['Inter'] text-muted-foreground">
                          <div className="inline-flex items-center gap-2">
                            <Badge variant={isAgent ? "secondary" : "outline"} className="capitalize">
                              {isAgent ? "agent" : "user"}
                            </Badge>
                            <span className="text-muted-foreground">{sentLabel}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="mt-3" />

                    {/* Email-like headers */}
                    <div className="mt-3 grid gap-1 text-sm font-['Inter']">
                      <div className="flex gap-2">
                        <span className="w-14 text-muted-foreground font-normal">From:</span>
                        <span className="font-medium truncate">{fromName}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-14 text-muted-foreground">To:</span>
                        <span className="truncate">{toName}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-14 text-muted-foreground">
                          Subject:
                        </span>
                        <span className="truncate">
                          Ticket #{ticketId} update
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <pre
                      className={[
                        "mt-3 m-0 rounded-[10px] border px-4 py-3",
                        "font-mono text-[13px] leading-6",
                        "whitespace-pre-wrap break-words",
                        isAgent
                          ? "bg-emerald-500/[0.06] dark:bg-emerald-400/10 border-emerald-500/15 dark:border-emerald-200/15 text-emerald-950 dark:text-emerald-50"
                          : "bg-blue-700/[0.04] dark:bg-white/5 border-blue-700/12 dark:border-white/12 text-[#0B1220] dark:text-[#E7ECF6]",
                      ].join(" ")}
                    >
                      {msg.content}
                    </pre>

                    {Array.isArray(msg.attachments) &&
                      msg.attachments.length > 0 && (
                        <div className="mt-4 rounded-[10px] border border-blue-700/10 dark:border-white/15 bg-blue-700/5 dark:bg-white/5 p-3">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Attachments
                          </div>

                          <div className="space-y-2">
                            {msg.attachments.map((file, i) =>
                              file ? (
                                <div
                                  key={i}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="text-sm truncate">
                                      {file.name || "attachment"}
                                    </span>
                                  </div>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      downloadAttachment(
                                        file.fileKey,
                                        file.name || "attachment"
                                      )
                                    }
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Reply Form */}
      {isClosed ? (
        <div className="rounded-[10px] border border-blue-700/10 dark:border-white/15 bg-blue-700/5 dark:bg-white/5 p-4 text-sm text-muted-foreground font-['Inter']">
          This ticket is closed. If you need further assistance, please open a
          new ticket.
        </div>
      ) : (
        <Card className="border border-blue-700/10 dark:border-white/15 bg-blue-700/5 dark:bg-white/5 shadow-none rounded-[10px]">
          <CardHeader className="bg-transparent rounded-t-[10px]">
            <CardTitle className="text-lg font-semibold font-['Space_Grotesk'] leading-8">
              Reply to Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              {ticketStatus === "resolved" && (
                <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-sm p-3 rounded border border-yellow-200 dark:border-yellow-900/40">
                  This ticket has been marked as resolved. Your reply will
                  reopen it.
                </div>
              )}

              <Textarea
                placeholder="Type your reply here..."
                className="justify-start h-auto px-5 py-4 text-[#454545] dark:text-[#B9C2D5]
                bg-blue-700/5 dark:bg-white/5 rounded-[10px]
                outline outline-1 outline-blue-700/10 dark:outline-white/20
                text-base font-normal placeholder:font-normal font-['Inter'] leading-6"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />

              <input
                id="upload"
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                multiple
                onChange={onFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("upload")?.click()}
                >
                  Upload files
                </Button>

                {attachments.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {attachments.length} file(s) selected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="text-sm border rounded px-2 py-1 flex gap-2 items-center bg-muted/20 dark:bg-muted/10"
                  >
                    <span className="max-w-[260px] truncate">{file.name}</span>
                    <Trash
                      className="h-4 w-4 text-red-500 cursor-pointer"
                      onClick={() => removeAttachment(idx)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!reply.trim() || isSending}>
                  <Send className="h-4 w-4 mr-1" />
                  {isSending ? "Sending..." : "Send Reply"}
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
