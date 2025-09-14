"use client";

import React, { useState } from "react";
import { useCreateTicketMutation } from "@/api/supportAPI";
import { selectUserId, selectAuthUser } from "@/redux/slices/auth/auth-slice";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { useSelector } from "react-redux";

import AttachmentUploader from "./attachment-uploader";
import PrioritySelectField from "./priority-select-field";
import { useFileValidation } from "../hooks/use-file-validation";
import { useUploadAttachment } from "../hooks/use-upload-attachment";

interface Props {
  setActiveTab: (tab: "tickets" | "new-ticket" | "faq") => void;
}

const NewTicket = ({ setActiveTab }: Props) => {
  const { toast } = useToast();

  const user = useSelector(selectAuthUser);
  const userId = useSelector(selectUserId);

  const [createTicket] = useCreateTicketMutation();

  const [formState, setFormState] = useState({
    subject: "",
    category: "technical",
    priority: "medium",
    description: "",
  });

  const { attachments, setAttachments, onFileChange, removeAttachment } =
    useFileValidation();
  const { uploadAttachment } = useUploadAttachment(userId);

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
              <PrioritySelectField
                value={formState.priority}
                setValue={(val) => handleSelectChange("priority", val)}
              />
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
            onUpload={onFileChange}
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
