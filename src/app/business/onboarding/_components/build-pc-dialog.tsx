"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogHeader, DialogContent } from "@/components/ui/dialog";

import { ArrowUpRight } from "lucide-react";

type BuildPcDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious: () => void;
  onBuildNow: () => void;
};

export function BuildPcDialog({
  open,
  onOpenChange,
  onPrevious,
  onBuildNow,
}: BuildPcDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[calc(100vw-1rem)] sm:w-[min(94vw,76rem)] max-w-none max-h-[90dvh] lg:min-h-[520px] p-0 overflow-y-auto md:overflow-hidden",
          "bg-white dark:bg-[#000624]",
        )}
      >
        <div className="grid h-full grid-cols-1 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10 bg-[#F5FAFE] dark:bg-white/5">
            <DialogHeader className="text-left space-y-3">
              <div className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs md:text-sm bg-[#2530F0]/10 text-[#2530F0] dark:bg-white/10 dark:text-[#B9C2D5]">
                Business onboarding
              </div>
              <DialogTitle className="!text-2xl md:!text-3xl !leading-tight">
                Build your first SensePC
              </DialogTitle>
            </DialogHeader>

            <div className="mt-6 space-y-3">
              {[
                "Choose your operating system and Hardware configuration for your first SensePC.",
                "Choose a plan and region",
                "Click build and your SensePC will be ready in minutes",
                "Assign users after creation from the dashboard",
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

          <div className="p-6 md:p-8 lg:p-10 flex lg:min-h-[520px] items-center justify-center">
            <div className="w-full max-w-[460px] space-y-5 text-center">
              <p className="text-[14px] font-semibold uppercase tracking-[-0.2px] text-[#2530F0] dark:text-[#8EA2FF]">
                Continue to Setup SensePC
              </p>
              <p className="text-paragraph text-sm md:text-base">
                Open the dashboard to create your first SensePC and assign users.
              </p>

              <div className="pt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={onPrevious}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-l from-[#a801ba] to-[#2530f0]"
                  onClick={onBuildNow}
                >
                  Build SensePC <ArrowUpRight />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
