// Full TicketDetailPage component with all JSX and logic

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  Send,
  User,
  Clock,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle2,
  Trash,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithUserId } from "@/lib/fetchWithUserId";

interface Ticket {
  ticketId: string;
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Closed" | string;
  category: string;
  priority: "Low" | "Medium" | "High" | string;
  createdAt: string;
  email: string;
  role?: string;
  attachments?: Attachment[];
}

interface Message {
  messageId: string;
  senderId: string;
  senderType: "customer" | "user" | "support";
  senderName?: string;
  type: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

interface Attachment {
  name: string;
  size: string;
  type: string;
  fileKey: string;
}

const TicketDetailPage = () => {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const ticketId = params.id as string;
  const [replyError, setReplyError] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [reply, setReply] = useState("");
  const [ticketStatus, setTicketStatus] = useState("Open");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [activeTab, setActiveTab] = useState("conversation");
  const [messageLimit, setMessageLimit] = useState(6);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const API_BASE = "https://lvir6hp7hb.execute-api.us-east-1.amazonaws.com/dev";
  const MAX_FILES = 2;
  const MAX_SIZE_MB = 3;
  const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
  const ALLOWED_TYPES = ["image/png", "image/jpeg"];

  useEffect(() => {
    if (ticketId && userId) {
      fetchTicket();
      fetchMessages();
    }
  }, [ticketId, userId]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop === 0 &&
        messages.length > visibleMessages.length
      ) {
        const newLimit = Math.min(messageLimit + 6, messages.length);
        setMessageLimit(newLimit);
        setVisibleMessages(messages.slice(-newLimit));
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages, messageLimit, visibleMessages]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [visibleMessages]);

  const fetchTicket = async () => {
    if (!userId) return;
    try {
      const res = await fetchWithUserId(`${API_BASE}/ticket/${ticketId}`, {
        method: "GET",
        userId,
      });
      const data = await res.json();
      setTicket(data);
      setTicketStatus(data.status);
      setTicketPriority(data.priority);
    } catch {
      toast({ title: "Failed to load ticket" });
    }
  };

  const fetchMessages = async () => {
    if (!userId) return;
    try {
      const res = await fetchWithUserId(
        `${API_BASE}/ticket/${ticketId}/messages`,
        {
          method: "GET",
          userId,
        }
      );
      const data = await res.json();
      setMessages(data);
      setVisibleMessages(data.slice(-messageLimit));
    } catch {
      toast({ title: "Failed to load messages" });
    }
  };

  const sanitizeFrontendFileName = (filename: string): string => {
    const base = filename.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_");
    return base.slice(0, 50);
  };

  const uploadAttachment = async (file: File) => {
    if (!userId) return;
    const sanitized = sanitizeFrontendFileName(file.name);
    const meta = {
      fileName: sanitized,
      fileType: file.type,
      fileSize: file.size,
    };
    const res = await fetchWithUserId(
      `${API_BASE}/ticket/${ticketId}/presign-upload`,
      {
        method: "POST",
        userId,
        body: meta,
      }
    );
    const { uploadUrl, fileKey } = await res.json();
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
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !reply.trim()) return;
    try {
      const uploaded = await Promise.all(attachments.map(uploadAttachment));
      await fetchWithUserId(`${API_BASE}/ticket/${ticketId}/message`, {
        method: "POST",
        userId,
        body: {
          senderId: userId,
          senderType: "customer",
          type: "message",
          content: reply,
          attachments: uploaded,
        },
      });
      if (ticketStatus.toLowerCase() === "open") {
        setTicketStatus("In Progress");
        await fetchWithUserId(`${API_BASE}/ticket/${ticketId}/status`, {
          method: "PATCH",
          userId,
          body: { status: "In Progress" },
        });
      }
      setReply("");
      setAttachments([]);
      fetchMessages();
      toast({ title: "Reply sent" });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to send reply" });
    }
  };

  const handleStatusChange = async (value: string) => {
    if (!userId) return;
    setTicketStatus(value);
    await fetchWithUserId(`${API_BASE}/ticket/${ticketId}/status`, {
      method: "PATCH",
      userId,
      body: { status: value },
    });
    toast({ title: `Status updated to ${value}` });
  };

  const handlePriorityChange = async (value: string) => {
    if (!userId) return;
    setTicketPriority(value);
    await fetchWithUserId(`${API_BASE}/ticket/${ticketId}/assign`, {
      method: "PATCH",
      userId,
      body: { assignedTo: userId },
    });
    toast({ title: `Priority updated to ${value}` });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const mergedFiles: File[] = [];
    for (const file of newFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: `Invalid file type: ${file.name}` });
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast({ title: `File too large: ${file.name}` });
        continue;
      }
      if (attachments.length + mergedFiles.length >= MAX_FILES) {
        toast({ title: `Only ${MAX_FILES} attachments allowed.` });
        break;
      }
      mergedFiles.push(file);
    }
    setAttachments((prev) => [...prev, ...mergedFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  if (!ticket) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/support")}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Support
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">{ticketStatus}</Badge>
                    <Badge variant="default">{ticketPriority} Priority</Badge>
                    <Badge variant="outline">{ticket?.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{ticket?.subject}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Ticket{" "}
                      {ticket?.ticketId}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Opened{" "}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="details">Ticket Details</TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="space-y-6 mt-6">
              <div
                className="space-y-6 max-h-[500px] overflow-y-auto pr-2"
                ref={messageContainerRef}
              >
                {visibleMessages.map((message) => (
                  <div
                    key={message.messageId}
                    className={`flex ${
                      message.senderType === "support"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <Card
                      className={`w-full max-w-lg border-2 rounded-xl shadow-md transition-transform transform hover:scale-[1.02] ${
                        message.senderType === "support"
                          ? "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700"
                          : "bg-green-50 dark:bg-slate-800 border-green-200 dark:border-slate-600"
                      } text-black dark:text-white`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback
                              className={`${
                                message.senderType === "support"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted dark:bg-slate-700 text-white"
                              }`}
                            >
                              {message.senderType === "support"
                                ? "ST"
                                : message.senderName
                                    ?.substring(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm flex items-center gap-1">
                              {message.senderName || "User"}
                              {message.senderType === "support" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border text-black dark:text-white dark:border-white"
                                >
                                  Staff
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground dark:text-gray-400">
                              {new Date(message.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line mb-2">
                          {message.content}
                        </p>
                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <div className="space-y-2">
                              {message.attachments.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <FileText className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reply to Support:</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReplySubmit} className="space-y-4">
                    <Textarea
                      placeholder="Type your reply here..."
                      className="min-h-[150px]"
                      value={reply}
                      onChange={(e) => {
                        const value = e.target.value;
                        const plainTextPattern = /^[a-zA-Z0-9\s.,\-_]*$/;
                        const doubleSpecialsPattern = /[.,\-_]{2,}/;

                        setReply(value);

                        if (value.length > 500) {
                          setReplyError(
                            "Message cannot exceed 500 characters."
                          );
                        } else if (!plainTextPattern.test(value)) {
                          setReplyError(
                            "Only plain text is allowed: letters, numbers, space, comma, dot, dash, and underscore."
                          );
                        } else if (doubleSpecialsPattern.test(value)) {
                          setReplyError(
                            "Avoid using multiple special characters in a row (e.g., '--', '..')."
                          );
                        } else {
                          setReplyError("");
                        }
                      }}
                      disabled={ticketStatus === "Closed"}
                    />

                    {replyError && (
                      <p className="text-sm text-red-500">{replyError}</p>
                    )}

                    <div>
                      <label className="text-sm font-medium">
                        Attachments (Max 2 - PNG/JPEG)
                      </label>
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("custom-file-input")
                              ?.click()
                          }
                          disabled={ticketStatus === "Closed"}
                          className="inline-flex items-center px-3 py-1.5 border border-input rounded text-sm bg-muted hover:bg-muted/80 disabled:opacity-50"
                        >
                          Choose Files
                        </button>
                        <input
                          id="custom-file-input"
                          type="file"
                          accept="image/png,image/jpeg"
                          multiple
                          onChange={handleFileChange}
                          disabled={ticketStatus === "Closed"}
                          className="hidden"
                        />
                      </div>

                      <div className="mt-2 flex gap-2 flex-wrap">
                        {attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 text-sm border p-1 rounded"
                          >
                            <span className="truncate max-w-[120px]">
                              {sanitizeFrontendFileName(file.name)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              disabled={ticketStatus === "Closed"}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={
                          !reply.trim() ||
                          ticketStatus === "Closed" ||
                          reply.length > 500 ||
                          !!replyError
                        }
                        className="gap-1"
                      >
                        <Send className="h-4 w-4" />
                        Send Reply
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket created by:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Email
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{ticket.email}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Role
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm px-2 py-0.5 border rounded bg-muted text-muted-foreground">
                            {ticket.role || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-foreground mb-1">
                        Ticket Description
                      </div>
                      <div className="bg-muted/30 border rounded-md p-4 text-sm text-foreground whitespace-pre-line mb-3">
                        {ticket.description}
                      </div>

                      {ticket?.attachments &&
                        ticket?.attachments?.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                              Attachments
                            </div>
                            <div className="space-y-1">
                              {ticket.attachments.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Status</div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={ticketStatus === "Closed" ? "outline" : "default"}
                  >
                    {ticketStatus}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Priority</div>
                <Select
                  value={ticketPriority}
                  onValueChange={handlePriorityChange}
                  disabled={ticketStatus === "Closed"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                variant="outline"
                className="w-full gap-1"
                onClick={() => handleStatusChange("Closed")}
                disabled={ticketStatus === "Closed"}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as Resolved
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
