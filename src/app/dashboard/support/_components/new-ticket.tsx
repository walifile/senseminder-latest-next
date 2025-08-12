import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AttachmentUploader from "./attachment-uploader";
import { ALLOWED_TYPES, MAX_FILE_SIZE_MB, MAX_FILES } from "../constants";
import { selectAuthUser, selectUserId } from "@/redux/slices/auth/auth-slice";
import { sanitizeFilename } from "@/lib/utils/index";

import api from "@/api/apiConfig";
import {
  useCreateTicketMutation,
  usePresignTicketUploadMutation,
} from "@/api/supportAPI";

const API_BASE = api?.SUPPORT_API_BASE;

interface Props {
  setActiveTab: (tab: "tickets" | "new-ticket" | "faq") => void;
}

const NewTicket = ({ setActiveTab }: Props) => {
  const { toast } = useToast();

  const user = useSelector(selectAuthUser);
  const userId = useSelector(selectUserId);

  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [presignUpload, { isLoading: isPresigning }] =
    usePresignTicketUploadMutation();

  const [formState, setFormState] = useState({
    subject: "",
    category: "technical",
    priority: "medium",
    description: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [subjectError, setSubjectError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));

    const errorSetter =
      id === "subject" ? setSubjectError : setDescriptionError;
    const maxLength = id === "subject" ? 50 : 500;

    if (value.length > maxLength) {
      errorSetter(`${id} cannot exceed ${maxLength} characters.`);
    } else if (!/^[a-zA-Z0-9\s.,-]*$/.test(value)) {
      errorSetter(
        "Only letters, numbers, dash, space, comma, and dot are allowed."
      );
    } else if (/[.,-]{2,}/.test(value)) {
      errorSetter("Avoid multiple special characters in a row.");
    } else {
      errorSetter("");
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
  };

  const handleNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      const uploaded = await Promise.all(attachments.map(uploadAttachment));
      const filtered = uploaded.filter(Boolean);

      const body = {
        userId,
        subject: formState.subject,
        description: formState.description,
        category: formState.category,
        priority: formState.priority,
        attachments: filtered,
        email: user?.email,
        role: user?.role,
      };

      await createTicket({ userId, body }).unwrap();

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
      setActiveTab("tickets");
    } catch {
      toast({ title: "Ticket creation failed" });
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachment = async (file: File) => {
    if (!userId) return null;
    try {
      const sanitized = sanitizeFilename(file.name);
      const meta = {
        fileName: sanitized,
        fileType: file.type,
        fileSize: file.size,
      };

      // const res = await fetchWithUserId(`${API_BASE}/ticket/presign-upload`, {
      //   method: "POST",
      //   userId,
      //   body: meta,
      // });
      // const { uploadUrl, fileKey } = await res.json();
      // await fetch(uploadUrl, {
      //   method: "PUT",
      //   headers: { "Content-Type": file.type },
      //   body: file,
      // });

      const { uploadUrl, fileKey } = await presignUpload({
        userId,
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

  return (
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
                onValueChange={(val) => handleSelectChange("category", val)}
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
                onValueChange={(val) => handleSelectChange("priority", val)}
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

          <AttachmentUploader
            files={attachments}
            onUpload={handleFileChange}
            onRemove={removeAttachment}
          />
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
  );
};

export default NewTicket;
