
// build-smartpc/src/app/build-smartpc/_components/billing-dialog.tsx

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
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
  Check,
  Clock,
  AlertCircle,
  CalendarDays,
  CalendarClock,
} from "lucide-react";

type BillingPlan = "hourly" | "daily" | "monthly";

type Props = {
  currentPlan: BillingPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Still accepted so we don’t break callers,
  // even if not used directly in the dialog UI.
  configId?: string;
  storageSize?: string | null;
  region?: string | null;
  autoRenewEnabled?: boolean;
  onToggleAutoRenew?: (enabled: boolean) => void | Promise<void>;

  onConfirm: (plan: BillingPlan) => void | Promise<void>;
};

const PLAN_COPY: Record<
  BillingPlan,
  {
    label: string;
    price: string;
    unit: string;
    tagline: string;
    estimateNote?: string;
    included: string[];
  }
> = {
  hourly: {
    label: "Hourly",
    price: "$0.247",
    unit: "/hour",
    tagline: "Perfect for quick tasks and testing",
    included: [
      "Pay only for actual usage",
      "No minimum commitment",
      "Support included",
    ],
  },
  daily: {
    label: "Daily",
    price: "$5.94",
    unit: "/day",
    tagline: "Ideal for day-long projects",
    estimateNote: "Estimated based on your current configuration",
    included: [
      "24-hour continuous access",
      "Savings up to 10% vs hourly",
      "Support included",
    ],
  },
  monthly: {
    label: "Monthly",
    price: "$178.24",
    unit: "/month",
    tagline: "Best value for regular users",
    estimateNote: "Estimated based on your current configuration",
    included: [
      "30-day continuous access.",
      "Saving up to 10% vs daily.",
      "Support included.",
    ],
  },
};

const PLAN_ORDER: BillingPlan[] = ["hourly", "daily", "monthly"];

export const BillingPlanDialog: React.FC<Props> = ({
  currentPlan,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [selectedPlan, setSelectedPlan] =
    React.useState<BillingPlan>(currentPlan);

  // ✅ keep this checkbox UI in the main dialog
  const [confirmChecked, setConfirmChecked] = React.useState(false);

  // ✅ confirmation dialog visibility
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setSelectedPlan(currentPlan);
      setConfirmChecked(false);
      setSubmitting(false);
      setConfirmOpen(false);
    } else {
      setConfirmOpen(false);
      setSubmitting(false);
    }
  }, [open, currentPlan]);

  const confirmNeeded = selectedPlan === "daily" || selectedPlan === "monthly";

  // ✅ keep original logic: daily/monthly requires checking the confirm row
  const canApply =
    selectedPlan !== currentPlan &&
    (!confirmNeeded || confirmChecked) &&
    !submitting;

  const handleApplyClick = () => {
    if (!canApply) return;
    // ✅ don't reset confirmChecked (user already confirmed in main dialog)
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (submitting) return;
    if (confirmNeeded && !confirmChecked) return;

    try {
      setSubmitting(true);
      await onConfirm(selectedPlan);

      setConfirmOpen(false);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const planCopy = PLAN_COPY[selectedPlan];

  const ConfirmRow = ({ className }: { className?: string }) => (
    <button
      type="button"
      onClick={() => setConfirmChecked((prev) => !prev)}
      className={cn(
        "font-['Space_Grotesk'] flex w-full items-center gap-3 rounded-[10px] border text-left",
        "px-4 py-4 sm:px-4 sm:py-4",
        "bg-[rgba(37,48,240,0.07)] border-[rgba(37,48,240,0.1)]",
        "dark:bg-[rgba(255,255,255,0.04)] dark:border-white/40",
        confirmChecked &&
          "border-[#2530f0] bg-[rgba(37,48,240,0.12)] dark:bg-white/10",
        className
      )}
    >
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-[6px] border",
          confirmChecked
            ? "border-[#2530f0] bg-[#2530f0] text-white dark:border-white dark:bg-white"
            : "border-[#020816]/40 bg-transparent dark:border-white/60"
        )}
      >
        {confirmChecked && (
          <Check className="h-3 w-3 text-white dark:text-[#140947]" />
        )}
      </div>

      <p className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
        I Understand, Confirm Apply
      </p>
    </button>
  );

  return (
    <>
      {/* MAIN DIALOG */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) setConfirmOpen(false);
          onOpenChange(next);
        }}
      >
        <DialogContent
          className={cn(
            // ✅ responsive width
            "w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-[640px]",
            // ✅ never exceed viewport height
            "max-h-[calc(100dvh-1.5rem)]",
            // ✅ allow internal layout + scrolling
            "flex flex-col overflow-hidden",
            // keep existing look
            "border-0 rounded-2xl shadow-xl font-['Space_Grotesk']",
            // ✅ tighter on small screens
            "px-4 py-4 sm:px-10 sm:py-8"
          )}
        >
          {/* TOP */}
          <DialogHeader className="flex shrink-0 flex-row items-start justify-between gap-3 p-0">
            <DialogTitle className="font-['Space_Grotesk'] text-lg sm:text-xl font-semibold tracking-[-0.04em] text-[#020816] dark:text-white">
              Change Plan
            </DialogTitle>
          </DialogHeader>

          {/* MIDDLE (scrollable) */}
          <div className="flex-1 overflow-y-auto pr-1 overscroll-contain">
            {/* Segmented control */}
            <div className="mt-4 sm:mt-6">
              <div
                className={cn(
                  "relative flex items-center px-1",
                  "h-11 sm:h-[50px]",
                  "bg-[rgba(37,48,240,0.07)] dark:bg-[#ffffff08]",
                  "rounded-[1000px] border-[none]",
                  "before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[1000px]",
                  "before:[background:linear-gradient(270deg,rgba(168,1,186,0.5)_0%,rgba(37,48,240,0.5)_100%)]",
                  "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
                  "before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]",
                  "before:z-[1] before:pointer-events-none"
                )}
              >
                <div className="relative z-[2] flex w-full items-center">
                  {PLAN_ORDER.map((plan) => {
                    const isActive = selectedPlan === plan;
                    const copy = PLAN_COPY[plan];

                    const Icon =
                      plan === "hourly"
                        ? Clock
                        : plan === "daily"
                          ? CalendarClock
                          : CalendarDays;

                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setConfirmChecked(false);
                        }}
                        className={cn(
                          "font-['Space_Grotesk'] flex flex-1 items-center justify-center gap-2 rounded-full",
                          "px-3 py-2 sm:px-4 sm:py-2",
                          "text-sm font-medium transition min-w-0",
                          isActive
                            ? "bg-[#2530f0] text-white"
                            : "bg-transparent text-[#454545] dark:text-[#b9c2d5] hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{copy.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price card */}
            <div className="mt-5 sm:mt-7 rounded-[10px] bg-[rgba(37,48,240,0.07)] px-4 py-4 dark:bg-[rgba(255,255,255,0.04)]">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-2">
                  <div className="flex items-end gap-2">
                    <span className="font-['Space_Grotesk'] text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-[#020816] dark:text-white">
                      {planCopy.price}
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-[#b9c2d5]">
                      {planCopy.unit}
                    </span>
                  </div>

                  <p className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-[#b9c2d5]">
                    {planCopy.tagline}
                  </p>

                  {planCopy.estimateNote && (
                    <div className="flex items-center gap-2 text-xs text-[#454545] dark:text-[#b9c2d5]">
                      <AlertCircle className="h-4 w-4 opacity-80" />
                      <span className="font-['Space_Grotesk']">
                        {planCopy.estimateNote}
                      </span>
                    </div>
                  )}
                </div>

                {selectedPlan === currentPlan && (
                  <div className="font-['Space_Grotesk'] inline-flex items-center gap-2 rounded-full bg-[rgba(45,216,90,0.12)] px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-[#2dd85a] dark:bg-[rgba(97,253,138,0.12)] dark:text-[#61fd8a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2dd85a] dark:bg-[#61fd8a]" />
                    Active
                  </div>
                )}
              </div>
            </div>

            {/* What's included */}
            <div className="mt-5 sm:mt-7 space-y-3">
              <h3 className="font-['Space_Grotesk'] text-base font-semibold tracking-[-0.03em] text-[#020816] dark:text-white">
                What&apos;s included
              </h3>

              <ul className="space-y-2">
                {planCopy.included.map((item) => (
                  <li
                    key={item}
                    className="font-['Space_Grotesk'] flex items-start gap-2 text-sm text-[#454545] dark:text-[#b9c2d5]"
                  >
                    <span className="mt-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-[#2530f0]">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Behavior / confirmation section */}
            <div className="mt-5 sm:mt-7 space-y-3">
              {selectedPlan === "hourly" ? (
                <div className="rounded-[10px] bg-[rgba(37,48,240,0.07)] px-4 py-4 dark:bg-[rgba(255,255,255,0.04)]">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-[2px] h-5 w-5 text-[#020816] dark:text-white" />
                    <div className="space-y-1">
                      <p className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                        Hourly billing behavior
                      </p>
                      <p className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-[#a3a3a3]">
                        With Hourly Plan you will not get charged for Stopped
                        computer CPU and Memory. However, SSD charges will
                        continue, since the disk remains allocated to preserve
                        your data.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-[10px] border border-[rgba(76,194,108,0.39)] bg-[rgba(39,174,96,0.15)] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-[2px] h-5 w-5 text-[#020816] dark:text-white" />
                      <div className="space-y-1">
                        <p className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                          Takes effect immediately
                        </p>
                        <p className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-[#a3a3a3]">
                          This change will take effect immediately and you will
                          be charged from the wallet.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ keep this (not removed) */}
                  <ConfirmRow />
                </>
              )}
            </div>

            <div className="h-2" />
          </div>

          {/* BOTTOM (footer) */}
          <DialogFooter className="mt-4 sm:mt-6 shrink-0 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto font-['Space_Grotesk']"
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleApplyClick}
              disabled={!canApply}
              className="w-full sm:w-auto font-['Space_Grotesk']"
            >
              {submitting ? "Applying..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (submitting) return;
          setConfirmOpen(next);
        }}
      >
        <DialogContent
          className={cn(
            "w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-md",
            "max-h-[calc(100dvh-1.5rem)]",
            "flex flex-col overflow-hidden",
            "rounded-2xl font-['Space_Grotesk']",
            "px-4 py-4 sm:px-8 sm:py-7"
          )}
        >
          {/* TOP */}
          <DialogHeader className="shrink-0 space-y-2">
            <DialogTitle className="text-lg sm:text-xl font-semibold tracking-[-0.04em]">
              Confirm Plan Change
            </DialogTitle>

            <DialogDescription className="space-y-3">
              <p>
                You are about to switch to{" "}
                <span className="font-semibold">
                  {PLAN_COPY[selectedPlan].label}
                </span>
                .
              </p>

              <div className="rounded-[10px] bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                <span className="font-semibold">Estimated:</span>{" "}
                {PLAN_COPY[selectedPlan].price} {PLAN_COPY[selectedPlan].unit}
              </div>

              {confirmNeeded && (
                <p className="text-sm">
                  This change takes effect immediately and will be charged from
                  your wallet.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* MIDDLE */}
          <div className="flex-1 overflow-y-auto pr-1 overscroll-contain">
            {confirmNeeded && <ConfirmRow className="mt-2" />}
            <div className="h-2" />
          </div>

          {/* BOTTOM */}
          <DialogFooter className="mt-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || (confirmNeeded && !confirmChecked)}
              className="w-full sm:w-auto"
            >
              {submitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
