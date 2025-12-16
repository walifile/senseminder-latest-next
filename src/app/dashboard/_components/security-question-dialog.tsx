"use client";

import { useState, useEffect } from "react";
import {
  getSecurityQuestion,
  setSecurityQuestion,
} from "@/api/security-question";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";

interface SecurityQuestionDialogProps {
  open: boolean;
  onClose: () => void;
}

const predefinedQuestions = [
  "What was your childhood nickname?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What city were you born in?",
  "What is your favorite teacher’s name?",
];

export default function SecurityQuestionDialog({
  open,
  onClose,
}: SecurityQuestionDialogProps) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [existingQuestion, setExistingQuestion] = useState<string | null>(null);
  const [hasExistingQuestion, setHasExistingQuestion] = useState(false);

  const [oldAnswer, setOldAnswer] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    if (open) {
      // reset all state on open
      setOldAnswer("");
      setNewAnswer("");
      setNewQuestion("");
      setSubmitting(false);
      setShowForgot(false);
      setLoading(true);

      getSecurityQuestion()
        .then((res) => {
          if (res?.question) {
            setHasExistingQuestion(true);
            setExistingQuestion(res.question);
          } else {
            setHasExistingQuestion(false);
            setExistingQuestion(null);
          }
        })
        .catch(() => {
          setHasExistingQuestion(false);
          setExistingQuestion(null);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!newQuestion || !newAnswer.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a question and provide an answer.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await setSecurityQuestion({
        question: newQuestion,
        answer: newAnswer,
        ...(hasExistingQuestion ? { oldAnswer } : {}),
      });

      toast({
        title: "Success",
        description: "Security question updated successfully.",
      });
      onClose();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to update security question.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {hasExistingQuestion
                ? "Update Security Question"
                : "Set Security Question"}
            </DialogTitle>
          </DialogHeader>

          {!loading && hasExistingQuestion && (
            <div className="space-y-2">
              <Label>Answer your current question</Label>
              <p className="text-sm text-muted-foreground">
                {existingQuestion}
              </p>
              <Input
                type="password"
                variant="auth"
                placeholder="Old Answer"
                value={oldAnswer}
                onChange={(e) => setOldAnswer(e.target.value)}
              />
            </div>
          )}

          {!loading && (
            <div className="space-y-2 mt-4">
              <Label>Select a new security question</Label>
              <Select value={newQuestion} onValueChange={setNewQuestion}>
                <SelectTrigger  variant="glowingSelector">
                  <SelectValue placeholder="Choose a question" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedQuestions.map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label className="pt-2">Answer</Label>
              <Input
                type="password"
                variant="auth"
                placeholder="New Answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </div>
          )}

          {!loading && hasExistingQuestion && (
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setShowForgot(true)}>
                I Forgot
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Saving..." : "Submit"}
                </Button>
              </div>
            </div>
          )}

          {!loading && !hasExistingQuestion && (
            <div className="flex justify-end pt-4 gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving..." : "Submit"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Optional: I Forgot Dialog */}
      {showForgot && (
        <Dialog open={showForgot} onOpenChange={setShowForgot}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Forgot Your Answer?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Please contact our support team to reset your security question.
              This is to protect your account from unauthorized changes.
            </p>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
