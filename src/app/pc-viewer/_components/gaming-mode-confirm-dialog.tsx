"use client";

import React from "react";

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import {
  Zap,
  ArrowRight,
  CircleCheck,
  MonitorPlay,
  ShieldCheck,
} from "lucide-react";

import {
  viewerGlassInnerClass,
  viewerGlassSurfaceClass,
  viewerGlassSurfaceStyle,
} from "./viewer-surface";

interface GamingModeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLaunching?: boolean;
}

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
    <div
      className={`
        rounded-xl border border-zinc-300/60 bg-white/65 p-4
        dark:border-zinc-700/60 dark:bg-zinc-900/55
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className="
            mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
            bg-zinc-100 text-zinc-700
            dark:bg-zinc-800 dark:text-zinc-200
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StepPill({ children }: { children: React.ReactNode }) {
    return (
      <div
        className="
          inline-flex min-h-12 min-w-[140px] items-center justify-center
          rounded-full border border-zinc-300/70 bg-white/80 px-4 py-2
          text-center text-sm font-medium leading-tight text-zinc-900 shadow-sm
          dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100
        "
      >
        <span className="block text-center leading-tight">{children}</span>
      </div>
    );
  }

export function GamingModeConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLaunching = false,
}: GamingModeConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={`
          w-[min(92vw,44rem)]
          max-w-xl
          max-h-[calc(100vh-2.5rem)]
          gap-0 overflow-hidden rounded-2xl p-0
          ${viewerGlassSurfaceClass}
        `}
        style={viewerGlassSurfaceStyle}
      >
        <div className="flex max-h-[calc(100vh-2.5rem)] flex-col overflow-hidden">
          <AlertDialogHeader className="shrink-0 border-b border-zinc-300/50 px-6 pb-5 pt-6 dark:border-zinc-700/50">
            <div className="flex items-start gap-4">
              <div
                className="
                  inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                  bg-[linear-gradient(135deg,rgba(79,70,229,0.14)_0%,rgba(124,58,237,0.18)_55%,rgba(192,38,211,0.16)_100%)]
                  ring-1 ring-inset ring-violet-300/40
                  dark:ring-violet-500/25
                "
              >
                <MonitorPlay className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="min-w-0">
                <AlertDialogTitle className="text-left text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Open NICE DCV Native Client
                </AlertDialogTitle>

                <AlertDialogDescription asChild>
                  <div className="mt-2 space-y-3 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                    <p>
                      Switch from the browser viewer to the NICE DCV native client for a more
                      stable, lower-latency remote desktop experience.
                    </p>

                    <p>
                      Your current browser session will remain active unless the native client opens
                      successfully and the handoff completes.
                    </p>
                  </div>
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="min-h-0 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <InfoCard
                  icon={<Zap className="h-4 w-4" />}
                  title="Better performance"
                  description="Improved responsiveness, lower latency, Max FPS and a smoother full desktop experience."
                />
                <InfoCard
                  icon={<CircleCheck className="h-4 w-4" />}
                  title="Safe handoff"
                  description="If the native client does not open, your browser session stays connected."
                />
                <InfoCard
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Controlled transition"
                  description="Once the handoff completes, you can close this browser tab if no longer needed."
                />
              </div>

              <div className={`${viewerGlassInnerClass} space-y-4 rounded-2xl p-4`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                    What happens next
                  </p>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                    After confirmation, SensePC will attempt to open the native client and transfer
                    the active session.
                  </p>
                </div>

                <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
                    <StepPill>Confirmation</StepPill>
                    <ArrowRight className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                    <StepPill>Native Client Launch</StepPill>
                    <ArrowRight className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                    <StepPill>Browser Viewer Disconnects</StepPill>
                </div>
              </div>

              <div
                className="
                  rounded-xl border border-zinc-300/60 bg-white/60 p-4
                  dark:border-zinc-700/60 dark:bg-zinc-900/50
                "
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Important</p>
                <ul className="mt-2 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                  <li>• If the native client is not installed, the switch will not complete.</li>
                  <li>• If the client opens successfully, the browser viewer will disconnect.</li>
                  <li>• You can reconnect later from the Connect flow if needed.</li>
                </ul>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="shrink-0 border-t border-zinc-300/50 px-6 py-4 dark:border-zinc-700/50 sm:justify-end">
            <AlertDialogCancel
              className="
                mt-0 cursor-pointer border-zinc-300/60 bg-white/75 text-zinc-900
                transition-all hover:bg-white
                dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900
              "
            >
              Stay in Browser
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onConfirm}
              disabled={isLaunching}
              className="
                cursor-pointer bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_55%,#C026D3_100%)]
                text-white shadow-[0_10px_30px_-12px_rgba(124,58,237,0.65)]
                transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70
              "
            >
              {isLaunching ? "Opening Native Client..." : "Open Native Client"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}