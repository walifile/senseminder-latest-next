"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { fetchWithUserId } from "@/lib/fetchWithUserId";

interface Ticket {
  ticketId: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  createdAt: string;
  attachments: Attachment[];
}

interface Attachment {
  name: string;
  size: string;
  type: string;
  fileKey: string;
}

const API_BASE = "https://lvir6hp7hb.execute-api.us-east-1.amazonaws.com/dev";
const MAX_FILES = 2;
const MAX_FILE_SIZE_MB = 3;
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

const sanitizeFilename = (filename: string) => {
  let name = filename.split("/").pop() || "file";
  name = name.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_");
  return name.slice(0, 50);
};

const SupportPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [query, setQuery] = useState("");
  const [formState, setFormState] = useState({
    subject: "",
    category: "technical",
    priority: "medium",
    description: "",
  });
  const [subjectError, setSubjectError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("tickets");
  console.log({ uploading });
  useEffect(() => {
    if (userId) loadTickets();
  }, [userId]);

  const loadTickets = async () => {
    if (!userId) return;
    try {
      const res = await fetchWithUserId(`${API_BASE}/tickets`, {
        method: "GET",
        userId,
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      toast({ title: "Failed to load tickets" });
    }
  };

  const plainTextPattern = /^[a-zA-Z0-9\s.,-]*$/;
  const doubleSpecialsPattern = /[.,-]{2,}/;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));

    const setError = id === "subject" ? setSubjectError : setDescriptionError;
    const maxLength = id === "subject" ? 50 : 500;

    if (value.length > maxLength) {
      setError(
        `${
          id[0].toUpperCase() + id.slice(1)
        } cannot exceed ${maxLength} characters.`
      );
    } else if (!plainTextPattern.test(value)) {
      setError(
        "Only letters, numbers, dash, space, comma, and dot are allowed."
      );
    } else if (doubleSpecialsPattern.test(value)) {
      setError("Avoid multiple special characters in a row.");
    } else {
      setError("");
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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
        toast({ title: "Only 2 attachments allowed." });
        break;
      }
      validFiles.push(file);
    }

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    const updated = [...attachments];
    updated.splice(index, 1);
    setAttachments(updated);
    setUploading((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAttachment = async (file: File, index: number) => {
    if (!userId) return null;
    setUploading((prev) => [...prev, index]);
    try {
      const sanitized = sanitizeFilename(file.name);
      const meta = {
        fileName: sanitized,
        fileType: file.type,
        fileSize: file.size,
      };
      const res = await fetchWithUserId(`${API_BASE}/ticket/presign-upload`, {
        method: "POST",
        userId,
        body: meta,
      });
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
    } catch (err) {
      console.log(err);
      toast({ title: `Upload failed for ${file.name}` });
      return null;
    } finally {
      setUploading((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      const uploaded = await Promise.all(
        attachments.map((file, i) => uploadAttachment(file, i))
      );
      const filtered = uploaded.filter(Boolean);
      const payload = {
        userId,
        subject: formState.subject,
        description: formState.description,
        category: formState.category,
        priority: formState.priority,
        attachments: filtered,
        email: user?.email,
        role: user?.role,
      };

      await fetchWithUserId(`${API_BASE}/ticket`, {
        method: "POST",
        userId,
        body: payload,
      });

      toast({ title: "Support ticket created" });
      setFormState({
        subject: "",
        category: "technical",
        priority: "medium",
        description: "",
      });
      setAttachments([]);
      setSubjectError("");
      setDescriptionError("");
      await loadTickets();

      // Fallback DOM-based tab switch
      setActiveTab("tickets");
      // const ticketsTab = document.querySelector(
      //   'button[data-value="tickets"]'
      // ) as HTMLElement | null;

      // if (tabTrigger && ticketsTab && tabTrigger !== ticketsTab) {
      //   ticketsTab.click();
      // }
    } catch {
      toast({ title: "Ticket creation failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticketId: string) => {
    router.push(`/dashboard/support/ticket/${ticketId}`);
  };

  const filterTickets = (ticket: Ticket) => {
    if (!query) return true;
    return ticket.subject.toLowerCase().includes(query.toLowerCase());
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Support Center</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="new-ticket">New Ticket</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* My Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6 mt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Track and manage your requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 md:grid-cols-6 p-4 font-medium border-b bg-muted/50">
                  <div className="col-span-2">Subject</div>
                  <div className="hidden md:block">Status</div>
                  <div className="hidden md:block">Priority</div>
                  <div className="hidden md:block">Created</div>
                </div>
                {tickets.length > 0 ? (
                  tickets.filter(filterTickets).map((ticket) => (
                    <div
                      key={ticket.ticketId}
                      onClick={() => handleTicketClick(ticket.ticketId)}
                      className="grid grid-cols-4 md:grid-cols-6 p-4 cursor-pointer hover:bg-muted/50"
                    >
                      <div className="col-span-2">{ticket.subject}</div>
                      <div className="hidden md:block">{ticket.status}</div>
                      <div className="hidden md:block">{ticket.priority}</div>
                      <div className="hidden md:block">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    No tickets found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Ticket Tab */}
        <TabsContent value="new-ticket" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create new support ticket</CardTitle>
              <CardDescription>
                Our support team will respond as soon as possible.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleNewTicket}>
              <CardContent className="space-y-4">
                <Input
                  id="subject"
                  placeholder="Subject"
                  value={formState.subject}
                  onChange={handleInputChange}
                />
                {subjectError && (
                  <p className="text-sm text-red-500">{subjectError}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={formState.category}
                      onValueChange={(val) =>
                        handleSelectChange("category", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={formState.priority}
                      onValueChange={(val) =>
                        handleSelectChange("priority", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Textarea
                  id="description"
                  placeholder="Describe your issue in detail"
                  value={formState.description}
                  onChange={handleInputChange}
                  className="min-h-[150px]"
                />
                {descriptionError && (
                  <p className="text-sm text-red-500">{descriptionError}</p>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Attachments (Max 2 - PNG/JPEG)
                  </label>
                  <label
                    htmlFor="ticket-file-upload"
                    className="inline-flex items-center px-3 py-1.5 bg-muted text-sm border rounded cursor-pointer hover:bg-muted/70 transition"
                  >
                    Upload Files
                  </label>
                  <input
                    id="ticket-file-upload"
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 text-sm border p-1 rounded"
                      >
                        <span className="truncate max-w-[120px]">
                          {sanitizeFilename(file.name)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formState.subject.trim() ||
                    !formState.description.trim() ||
                    !!subjectError ||
                    !!descriptionError
                  }
                >
                  {loading ? "Submitting..." : "Submit Ticket"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>Common questions and solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>How do I reset my SmartPC?</strong>
                <p className="text-sm text-muted-foreground">
                  Go to your dashboard, select your PC, then choose "Reset".
                </p>
              </div>
              <div>
                <strong>What happens if I exceed storage?</strong>
                <p className="text-sm text-muted-foreground">
                  You won't be able to upload files until space is cleared or
                  plan upgraded.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportPage;
