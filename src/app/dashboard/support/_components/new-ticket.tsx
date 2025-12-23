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
  
    // Normalize common “smart” punctuation to plain equivalents for validation
    const v = value
      .normalize("NFKC")
      .replace(/[\u2018\u2019]/g, "'") // ‘ ’ -> '
      .replace(/[\u201C\u201D]/g, '"') // “ ” -> "
      .replace(/\u00A0/g, " "); // non-breaking space -> space
  
    // Allow normal writing punctuation (industry-standard-ish) + Unicode letters/numbers
    const allowed = /^[\p{L}\p{N}\s[\\\].,!?'"():;/@#&_-]*$/u;
    const tooManyPunctInARow = /[[\\\].,!?'"():;/@#&_-]{4,}/;      
  
    if (v.length > maxLength) {
      errorSetter(`${id} cannot exceed ${maxLength} characters.`);
    } else if (/[<>]/.test(v)) {
      errorSetter("Please avoid using < or > characters.");
    } else if (!allowed.test(v)) {
      errorSetter("Please use standard text and punctuation only.");
    } else if (tooManyPunctInARow.test(v)) {
      errorSetter("Avoid too many special characters in a row.");
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

      toast({
        title: (
          <span data-testid="support-success-message">
            Support ticket created
          </span>
        ),
      });
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
    <>
      <div
        data-testid="dashboard-support-new-ticket-header"
        className="p-[30px] pt-0 space-y-5 border-b border-black/10 dark:border-border"
      >
        <div className="space-y-1">
          <div className="justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8">
            Create new support ticket
          </div>
          <div className="justify-start text-[#454545] dark:text-paragraph text-base font-normal font-['Inter'] leading-6">
            Our support team will respond as soon as possible.
          </div>
        </div>
      </div>
      <form
        data-testid="dashboard-support-new-ticket-form"
        onSubmit={handleNewTicket}
        className="space-y-8 px-[30px]"
      >
        <div className="space-y-8">
          <div className="space-y-2.5">
            <label className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
              Subject
            </label>
            <Input
              id="subject"
              placeholder="Type subject"
              value={formState.subject}
              onChange={handleInputChange}
              className="justify-start h-auto px-5 py-4 text-[#454545] dark:text-[#B9C2D5] bg-blue-700/5 text-base font-normal placeholder:font-normal font-['Inter'] leading-6 rounded-[10px]"
              data-testid="support-subject-input"
            />
            {subjectError && (
              <p className="text-sm text-red-500">{subjectError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                Category
              </label>
              <Select
                value={formState.category}
                onValueChange={(val) => handleSelectChange("category", val)}
              >
                <SelectTrigger
                  variant="glowingSelector"
                  data-testid="support-category-dropdown"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <label className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                Priority
              </label>
              <PrioritySelectField
                value={formState.priority}
                setValue={(val) => handleSelectChange("priority", val)}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe you issue in detail"
              value={formState.description}
              onChange={handleInputChange}
              className="min-h-[200px] self-stretch relative bg-blue-700/5 dark:bg-white/5 rounded-[10px] outline outline-1 outline-blue-700/10 dark:outline-white/20"
              data-testid="support-description-textarea"
            />
            {descriptionError && (
              <p className="text-sm text-red-500">{descriptionError}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <label className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
              Attachments
            </label>
            <AttachmentUploader
              files={attachments}
              onUpload={onFileChange}
              onRemove={removeAttachment}
            />
          </div>
        </div>
        <div className="flex justify-center pb-[40px]">
          <Button
            type="submit"
            disabled={
              loading ||
              !formState.subject.trim() ||
              !formState.description.trim() ||
              !!subjectError ||
              !!descriptionError
            }
            data-testid="support-submit-ticket-button"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default NewTicket;
