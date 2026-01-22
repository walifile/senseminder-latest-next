"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { selectAuthUser } from "@/redux/slices/auth/auth-slice";
import {
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useUpdateTicketPriorityMutation,
  usePresignTicketDownloadMutation,
} from "@/api/supportAPI";

import { Logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatDateTime, formatTimeLabel } from "@/lib/utils/format-time";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";

import { useSelector } from "react-redux";

import { ChevronLeft, CheckCircle2 } from "lucide-react";

import TicketConversation from "../../_components/ticket-conversation";
import { getStatusBadgeClass } from "../../utils/get-status-badge-class";
import PrioritySelectField from "../../_components/priority-select-field";

import type { Attachment } from "../../types";

const formatLabel = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).replace("-", " ");

const TicketDetailPage = () => {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const authUser = useSelector(selectAuthUser);

  const userId = authUser?.id;
  const ticketId = params.id as string;

  const [priority, setPriority] = useState<string>("");
  const [attachmentPreviews, setAttachmentPreviews] = useState<
    { url: string; name: string; type?: string }[]
  >([]);

  const [updateStatus] = useUpdateTicketStatusMutation();
  const [updatePriority] = useUpdateTicketPriorityMutation();
  const [presignDownload] = usePresignTicketDownloadMutation();

  const {
    data: ticket,
    isLoading,
    isFetching,
  } = useGetTicketByIdQuery(
    { userId, id: ticketId },
    { skip: !userId || !ticketId }
  );

  useEffect(() => {
    const fetchAttachmentPreviews = async () => {
      if (ticket?.attachments?.length && userId) {
        const previews = await Promise.all(
          ticket.attachments.map(async (att: Attachment) => {
            try {
              const { downloadUrl } = await presignDownload({
                userId,
                ticketId,
                fileKey: att.fileKey,
              }).unwrap();

              return {
                url: downloadUrl,
                name: att.name || "attachment",
                type: att.type,
              };
            } catch (err) {
              Logger.warn("Failed to get presigned URL", err);
              return null;
            }
          })
        );
        setAttachmentPreviews(previews.filter(Boolean));
      }
    };

    if (ticket) {
      setPriority(ticket.priority ?? "");
      fetchAttachmentPreviews();
    }
  }, [ticket, presignDownload, ticketId, userId]);

  const handleStatusChange = async (value: string) => {
    try {
      await updateStatus({ userId, id: ticketId, status: value }).unwrap();
      toast({ title: `Status updated to ${value}` });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handlePriorityChange = async (value: string) => {
    try {
      await updatePriority({ userId, id: ticketId, priority: value }).unwrap();
      setPriority(value);
      toast({ title: `Priority updated to ${value}` });
    } catch {
      toast({ title: "Failed to update priority", variant: "destructive" });
    }
  };

  if (!userId) {
    return (
      <div
        data-testid="dashboard-support-ticket-error"
        className="text-red-500 text-sm"
      >
        Something went wrong loading your ticket. Please try refreshing the page
        or sign in again.
        <br />
      </div>
    );
  }

  if (isLoading || isFetching || !ticket)
    return (
      <div data-testid="dashboard-support-ticket-loading">
        Loading ticket...
      </div>
    );

  const isClosed = ticket.status === "closed";

  return (
    <div data-testid="dashboard-support-ticket-page" className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/support")}
        className="gap-1"
        data-testid="support-back-button"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Support
      </Button>

      {/* Subject and status */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1
          className="text-2xl font-bold font-['Space_Grotesk'] leading-8"
          data-testid="support-ticket-title"
        >
          {ticket.subject}
        </h1>
        <div
          className={getStatusBadgeClass(ticket.status)}
          data-testid="support-ticket-status"
        >
          {formatLabel(ticket.status)}
        </div>
      </div>

      {/* Description */}
      <div className="bg-blue-700/5 dark:bg-white/5 p-4 rounded-[10px] outline outline-1 outline-blue-700/10 dark:outline-white/20 text-base font-['Inter'] leading-6 text-[#454545] dark:text-[#B9C2D5] whitespace-pre-line">
        {ticket.description}
      </div>

      {/* Attachment Previews */}
      {attachmentPreviews.length > 0 && (
        <div className="space-y-2 mb-6">
          <h4 className="text-sm font-medium">Attached Files:</h4>
          <div className="flex flex-wrap gap-4">
            {attachmentPreviews.map((file, i) => (
              <div key={i} className="border rounded-md p-2 max-w-xs">
                {file.type?.startsWith("image/") ? (
                  <>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-32 object-cover rounded hover:scale-105 transition"
                      />
                    </a>
                    <div className="text-xs text-center mt-1 truncate">
                      {file.name}
                    </div>
                    <a
                      href={file.url}
                      download={
                        file.name?.includes(".")
                          ? file.name
                          : `${file.name}.jpeg`
                      }
                      className="text-blue-600 text-xs underline block text-center mt-1"
                    >
                      Download
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600"
                    >
                      {file.name}
                    </a>
                    <a
                      href={file.url}
                      download
                      className="text-xs block text-blue-500 underline mt-1"
                    >
                      Download
                    </a>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_420px] gap-6 w-full">
        {/* Left: Ticket Conversation */}
        <div className="w-full">
          <TicketConversation
            ticketId={ticketId}
            userId={userId}
            isClosed={isClosed}
            ticketStatus={ticket.status}
            senderType="customer"
          />
        </div>

        {/* Right: Ticket Info */}
        <div className="w-full space-y-6 mt-8">
          <Card
            className="border border-blue-700/10 dark:border-white/15 bg-blue-700/5 dark:bg-white/5 shadow-none rounded-[10px]"
            data-testid="support-ticket-info"
          >
            <CardHeader className="bg-transparent rounded-t-[10px]">
              <CardTitle className="text-lg font-semibold font-['Space_Grotesk'] leading-8">
                Ticket Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-['Inter'] text-base leading-6 text-[#454545] dark:text-[#B9C2D5]">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div className="text-muted-foreground">Email</div>
                <div className="truncate">{ticket.email}</div>

                <div className="text-muted-foreground">Role</div>
                <div className="capitalize">{ticket.role || "N/A"}</div>

                <div className="text-muted-foreground">Ticket ID</div>
                <div className="break-all">{ticket.ticketId}</div>

                <div className="text-muted-foreground">Created</div>
                <div>
                  {formatDateTime(ticket.createdAt, "PPP p")}{" "}
                  <span className="text-muted-foreground">({formatTimeLabel(ticket.createdAt).split(" ").slice(-1)[0]})</span>
                </div>

                <div className="text-muted-foreground">Category</div>
                <div className="capitalize">{ticket.category}</div>

                <div className="text-muted-foreground">Status</div>
                <div>
                  <span className={getStatusBadgeClass(ticket.status)}>
                    {formatLabel(ticket.status)}
                  </span>
                </div>

                <div className="text-muted-foreground">Priority</div>
                <div>
                  <PrioritySelectField
                    value={priority}
                    setValue={handlePriorityChange}
                    disabled={isClosed}
                  />
                </div>
              </div>

              {!isClosed && (
                <Button
                  variant="outline"
                  className="w-full gap-1 mt-3"
                  onClick={() => handleStatusChange("resolved")}
                  data-testid="support-mark-resolved-button"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Resolved
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
