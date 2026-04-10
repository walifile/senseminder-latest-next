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
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  CircleCheck,
  AlertTriangle,
} from "lucide-react";

type ConfirmRebootModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  desktopName: string;
  isRebooting: boolean;
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

export const ConfirmRebootModal: React.FC<ConfirmRebootModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  desktopName,
  isRebooting,
}) => (
  <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      if (!open && !isRebooting) onClose();
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
                Reboot Sense PC
              </DialogTitle>

              <DialogDescription asChild>
                <div className="mt-2 space-y-3 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                  <p>
                    You are about to reboot{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {desktopName}
                    </span>
                    . This will temporarily interrupt remote access while the
                    system restarts.
                  </p>

                  <p>
                    Active sessions will end during the reboot process. You can
                    reconnect from the dashboard after the computer becomes
                    available again.
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
                icon={<RotateCcw className="h-4 w-4" />}
                title="System reboot"
                description="The PC will restart and end active access."
              />
              <InfoCard
                icon={<CircleCheck className="h-4 w-4" />}
                title="Downtime"
                description="Most reboots take around 1–2 minutes."
              />
              <InfoCard
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Reconnect"
                description="Connect again from the dashboard when ready."
              />
            </div>

            <div className="rounded-2xl border border-zinc-300/60 bg-white/65 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/55">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  What happens next
                </p>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                  After confirmation, SensePC will send a reboot request and
                  temporarily end active remote access.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <StepPill>Confirm</StepPill>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                <StepPill>Reboot starts</StepPill>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                <StepPill>Reconnect</StepPill>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Important
              </p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                <li>• All active remote connections will disconnect during reboot.</li>
                <li>• Unsaved work inside the remote computer may be affected.</li>
                <li>• Reconnect from the dashboard after the reboot completes.</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-zinc-300/50 px-6 py-4 sm:justify-end dark:border-zinc-700/50">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isRebooting}
            className="border-zinc-300/60 bg-white/75 text-zinc-900 transition-all hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            variant="destructive"
            disabled={isRebooting}
            className="shadow-sm"
          >
            {isRebooting ? "Rebooting..." : "Reboot PC"}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
);