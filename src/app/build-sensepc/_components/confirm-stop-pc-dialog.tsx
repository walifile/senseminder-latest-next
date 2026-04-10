"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Square,
  HardDrive,
  ArrowRight,
  CircleCheck,
  AlertTriangle,
} from "lucide-react";

type ConfirmStopModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  desktopName: string;
  isStopping: boolean;
};

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-300/60 bg-white/70 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/60">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        inline-flex h-10 min-w-0 flex-1 items-center justify-center
        rounded-full border border-zinc-300/70 bg-white/80 px-3 py-1.5
        text-center text-xs font-medium leading-tight text-zinc-900 shadow-sm
        dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100
      "
    >
      <span className="block truncate text-center leading-tight">{children}</span>
    </div>
  );
}

export const ConfirmStopModal: React.FC<ConfirmStopModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  desktopName,
  isStopping,
}) => (
  <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      if (!open && !isStopping) onClose();
    }}
  >
    <DialogContent className="w-[min(92vw,44rem)] max-w-xl gap-0 overflow-hidden rounded-2xl border-zinc-300/60 p-0 dark:border-zinc-700/60">
      <div className="flex max-h-[calc(100vh-2.5rem)] flex-col overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-zinc-300/50 px-6 pb-5 pt-6 dark:border-zinc-700/50">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(245,158,11,0.12)_0%,rgba(245,158,11,0.18)_100%)] ring-1 ring-inset ring-amber-300/40 dark:ring-amber-500/25">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-left text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Stop Sense PC
              </DialogTitle>

              <DialogDescription asChild>
                <div className="mt-2 space-y-3 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                  <p>
                    You are about to stop{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {desktopName}
                    </span>
                    . This will end active remote access until the computer is started again.
                  </p>

                  <p>
                    If this PC is on the <span className="font-semibold">Hourly Plan</span>, SSD
                    storage charges continue while the computer is stopped because the disk remains
                    allocated to preserve your data.
                  </p>
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <InfoCard
                icon={<Square className="h-4 w-4" />}
                title="PC stops"
                description="The computer will shut down and active remote access will end."
              />
              <InfoCard
                icon={<HardDrive className="h-4 w-4" />}
                title="Storage remains"
                description="Your disk stays allocated so your data remains available when you start the PC again."
              />
              <InfoCard
                icon={<CircleCheck className="h-4 w-4" />}
                title="Start again later"
                description="You can return to the dashboard and start the computer whenever you need it."
              />
            </div>

            <div className="rounded-2xl border border-zinc-300/60 bg-white/65 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/55">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  What happens next
                </p>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                  After confirmation, SensePC will send a stop request and end current remote
                  access.
                </p>
              </div>

              <div className="mt-4 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
                <StepPill>Confirmation</StepPill>
                <ArrowRight className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                <StepPill>PC Stops</StepPill>
                <ArrowRight className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                <StepPill>Start Again</StepPill>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Important
              </p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                <li>• All active remote connections will disconnect when the PC stops.</li>
                <li>• On the Hourly Plan, SSD storage charges continue while the PC is stopped.</li>
                <li>• Your data remains on the allocated disk and will be available when restarted.</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-zinc-300/50 px-6 py-4 sm:justify-end dark:border-zinc-700/50">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isStopping}
            className="border-zinc-300/60 bg-white/75 text-zinc-900 transition-all hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            variant="destructive"
            disabled={isStopping}
            className="shadow-sm"
          >
            {isStopping ? "Stopping..." : "Stop PC"}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
);