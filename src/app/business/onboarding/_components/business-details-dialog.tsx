"use client";

/* eslint-disable perfectionist/sort-imports */

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTitle, DialogHeader, DialogContent } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BusinessDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessOrganization: string;
  businessTeamSize: string;
  onBusinessTeamSizeChange: (value: string) => void;
  businessTargetPcCount: string;
  onBusinessTargetPcCountBlur: () => void;
  onBusinessTargetPcCountChange: (value: string) => void;
  businessUseCase: string;
  onBusinessUseCaseChange: (value: string) => void;
  onNext: () => void | Promise<void>;
  isSavingBusinessDetails: boolean;
};

export function BusinessDetailsDialog({
  open,
  onOpenChange,
  businessOrganization,
  businessTeamSize,
  onBusinessTeamSizeChange,
  businessTargetPcCount,
  onBusinessTargetPcCountBlur,
  onBusinessTargetPcCountChange,
  businessUseCase,
  onBusinessUseCaseChange,
  onNext,
  isSavingBusinessDetails,
}: BusinessDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[calc(100vw-1rem)] sm:w-[min(94vw,76rem)] max-w-none max-h-[90dvh] p-0 overflow-y-auto md:overflow-hidden",
          "bg-white dark:bg-[#000624]",
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10 bg-[#F5FAFE] dark:bg-white/5 lg:flex lg:flex-col lg:justify-center">
            <DialogHeader className="text-left space-y-3">
              <div className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs md:text-sm bg-[#2530F0]/10 text-[#2530F0] dark:bg-white/10 dark:text-[#B9C2D5]">
                Business onboarding
              </div>
              <DialogTitle className="!text-2xl md:!text-3xl !leading-tight">
                Tell us about your business
              </DialogTitle>
            </DialogHeader>

            <div className="mt-6 space-y-3">
              {[
                "Confirm organization information from your account",
                "Estimate team size and pilot desktop count",
                "Share your business details",
              ].map((item) => (
                <div
                  key={item}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm md:text-base",
                    "bg-white dark:bg-[#FFFFFF08]",
                    "border border-black/5 dark:border-white/10",
                  )}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10 space-y-6">
            <div className="space-y-2">
              <p className="text-[14px] font-semibold uppercase tracking-[-0.2px] text-[#2530F0] dark:text-[#8EA2FF]">
                Business details
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="onboarding-business-organization"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Organization name
              </label>
              <Input
                id="onboarding-business-organization"
                type="text"
                value={businessOrganization}
                placeholder="Organization name"
                uiSize="lg"
                disabled
                className="disabled:cursor-default disabled:opacity-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label
                  htmlFor="onboarding-team-size"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Team size
                </label>
                <Input
                  id="onboarding-team-size"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={businessTeamSize}
                  onChange={(e) => onBusinessTeamSizeChange(e.target.value)}
                  uiSize="lg"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="onboarding-target-pc-count"
                    className="text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Number of PCs
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                        aria-label="Default PC quota information"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start">
                      Default PC quota is 3.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="onboarding-target-pc-count"
                  type="number"
                  min={3}
                  value={businessTargetPcCount}
                  onChange={(e) => onBusinessTargetPcCountChange(e.target.value)}
                  onBlur={onBusinessTargetPcCountBlur}
                  uiSize="lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="onboarding-business-use-case"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Tell us about your business use case
              </label>
              <Textarea
                id="onboarding-business-use-case"
                value={businessUseCase}
                onChange={(e) => onBusinessUseCaseChange(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                size="lg"
                className="bg-gradient-to-l from-[#a801ba] to-[#2530f0]"
                onClick={onNext}
                disabled={isSavingBusinessDetails}
              >
                {isSavingBusinessDetails ? "Saving..." : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
