
"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  useLazyGetSecurityQuestionQuery,
  useSetSecurityQuestionMutation,
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

function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin",
        className,
      ].join(" ")}
      aria-label="Loading"
      role="status"
    />
  );
}

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
  const ignoreNextParentCloseRef = useRef(false);
  const [triggerGetSecurityQuestion] = useLazyGetSecurityQuestionQuery();
  const [setSecurityQuestion] = useSetSecurityQuestionMutation();

  const closeForgotSafely = () => {
    ignoreNextParentCloseRef.current = true;
    setShowForgot(false);

    setTimeout(() => {
      ignoreNextParentCloseRef.current = false;
    }, 0);
  };

  const handleUpdateDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) return;

    if (ignoreNextParentCloseRef.current) return;

    if (showForgot) {
      closeForgotSafely();
      return;
    }

    onClose();
  };

  const handleForgotDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setShowForgot(true);
      return;
    }
    closeForgotSafely();
  };

  useEffect(() => {
    if (open) {
      // reset all state on open
      setOldAnswer("");
      setNewAnswer("");
      setNewQuestion("");
      setSubmitting(false);
      setShowForgot(false);
      setLoading(true);

      triggerGetSecurityQuestion()
        .unwrap()
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
      }).unwrap();

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
      <Dialog open={open} onOpenChange={handleUpdateDialogOpenChange}>
        <DialogContent
          data-testid="dashboard-security-question-dialog"
          className="sm:max-w-[500px]"
          onInteractOutside={(e) => {
            if (showForgot) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (showForgot) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (showForgot) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {hasExistingQuestion ? "Update Security Question" : "Set Security Question"}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="relative mt-4">
              {/* subtle skeleton background */}
              <div className="space-y-4 opacity-40 dark:opacity-30">
                <div className="h-4 w-2/3 rounded bg-muted/40 dark:bg-muted/20" />
                <div className="h-10 w-full rounded bg-muted/30 dark:bg-muted/15" />
                <div className="h-4 w-1/2 rounded bg-muted/40 dark:bg-muted/20" />
                <div className="h-10 w-full rounded bg-muted/30 dark:bg-muted/15" />
                <div className="h-4 w-1/3 rounded bg-muted/40 dark:bg-muted/20" />
                <div className="h-10 w-full rounded bg-muted/30 dark:bg-muted/15" />
                <div className="pt-4 flex gap-3">
                  <div className="h-10 flex-1 rounded bg-muted/30 dark:bg-muted/15" />
                  <div className="h-10 flex-1 rounded bg-muted/30 dark:bg-muted/15" />
                </div>
              </div>

              {/* centered spinner overlay */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-3 rounded-lg border bg-white px-6 py-4 shadow-sm dark:bg-[#140947]">
                <Spinner />
                <p className="text-sm text-muted-foreground">Loading security question…</p>
              </div>



              </div>
            </div>
          ) : (
            <>
              {hasExistingQuestion && (
                <div className="space-y-2">
                  <Label>Answer your current question</Label>
                  <p className="text-sm text-muted-foreground">{existingQuestion}</p>
                  <Input
                    type="password"
                    variant="auth"
                    placeholder="Old Answer"
                    value={oldAnswer}
                    onChange={(e) => setOldAnswer(e.target.value)}
                  />
                </div>
              )}

              <div className="mt-4 space-y-2">
                <Label>Select a new security question</Label>
                <Select value={newQuestion} onValueChange={setNewQuestion}>
                  <SelectTrigger variant="glowingSelector">
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

              {hasExistingQuestion ? (
                <div className="pt-4">
                  <div className="grid grid-cols-2 gap-3 sm:hidden">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="w-full"
                    >
                      I Forgot
                    </Button>

                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full"
                    >
                      {submitting ? "Saving..." : "Submit"}
                    </Button>
                  </div>

                  <div className="hidden sm:flex sm:justify-between sm:gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setShowForgot(true)}
                    >
                      I Forgot
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Saving..." : "Submit"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-4 gap-2">
                  <Button variant="outline" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Saving..." : "Submit"}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {showForgot && (
        <Dialog open={showForgot} onOpenChange={handleForgotDialogOpenChange}>
          <DialogContent
            data-testid="dashboard-security-question-forgot-dialog"
            className="sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle>Forgot Your Answer?</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              Please contact our support team to reset your security question.
              This is to protect your account from unauthorized changes.
            </p>

            <div className="flex justify-center pt-6 sm:justify-end">
              <Button type="button" onClick={closeForgotSafely}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
