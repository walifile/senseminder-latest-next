
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
      "15% savings vs hourly",
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
      "30-day continuous access",
      "35% savings vs weekly",
      "Support included",
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
  const [selectedPlan, setSelectedPlan] = React.useState<BillingPlan>(currentPlan);
  const [confirmChecked, setConfirmChecked] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setSelectedPlan(currentPlan);
      setConfirmChecked(false);
      setSubmitting(false);
    }
  }, [open, currentPlan]);

  const confirmNeeded = selectedPlan === "daily" || selectedPlan === "monthly";

  const canApply =
    selectedPlan !== currentPlan &&
    (!confirmNeeded || confirmChecked) &&
    !submitting;

  const handleApply = async () => {
    if (!canApply) return;

    try {
      setSubmitting(true);
      await onConfirm(selectedPlan);
    } finally {
      setSubmitting(false);
    }
  };

  const planCopy = PLAN_COPY[selectedPlan];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[640px] border-0",
          "rounded-2xl px-6 py-6 sm:px-10 sm:py-8",
          "shadow-xl"
        )}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-start justify-between gap-4 p-0">
          <DialogTitle className="text-xl font-semibold tracking-[-0.04em] text-[#020816] dark:text-white">
            Change Plan
          </DialogTitle>

          {/* <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full",
              "bg-black/5 text-[#020816] hover:bg-black/10",
              "dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            )}
          >
            <X className="h-4 w-4" />
          </button> */}
        </DialogHeader>

        {/* Segmented control */}
        <div className="mt-6">
          <div
            className={cn(
              "relative flex h-[50px] items-center px-1",
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
                      "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition min-w-0",
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
        <div className="mt-7 rounded-[10px] bg-[rgba(37,48,240,0.07)] px-4 py-4 dark:bg-[rgba(255,255,255,0.04)]">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold tracking-[-0.04em] text-[#020816] dark:text-white">
                  {planCopy.price}
                </span>
                <span className="text-sm text-[#454545] dark:text-[#b9c2d5]">
                  {planCopy.unit}
                </span>
              </div>
              <p className="text-sm text-[#454545] dark:text-[#b9c2d5]">
                {planCopy.tagline}
              </p>

              {planCopy.estimateNote && (
                <div className="mt-1 flex items-center gap-2 text-xs text-[#454545] dark:text-[#b9c2d5]">
                  <AlertCircle className="h-4 w-4 opacity-80" />
                  <span>{planCopy.estimateNote}</span>
                </div>
              )}
            </div>

            {selectedPlan === currentPlan && (
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(45,216,90,0.12)] px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-[#2dd85a] dark:bg-[rgba(97,253,138,0.12)] dark:text-[#61fd8a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2dd85a] dark:bg-[#61fd8a]" />
                Active
              </div>
            )}
          </div>
        </div>

        {/* What's included */}
        <div className="mt-6 space-y-3">
          <h3 className="text-base font-semibold tracking-[-0.03em] text-[#020816] dark:text-white">
            What&apos;s included
          </h3>

          <ul className="space-y-2">
            {planCopy.included.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-[#454545] dark:text-[#b9c2d5]"
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
        <div className="mt-6 space-y-3">
          {selectedPlan === "hourly" ? (
            <div className="rounded-[10px] bg-[rgba(37,48,240,0.07)] px-4 py-4 dark:bg-[rgba(255,255,255,0.04)]">
              <div className="flex items-start gap-3">
                <div className="mt-[2px]">
                  <AlertCircle className="h-5 w-5 text-[#020816] dark:text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#020816] dark:text-white">
                    Hourly billing behavior
                  </p>
                  <p className="text-sm text-[#454545] dark:text-[#a3a3a3]">
                    With Hourly Plan you will not get charged for Stopped
                    computer CPU and Memory. However, SSD charges will
                    continue, since the disk remains allocated to preserve your
                    data.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-[10px] border border-[rgba(76,194,108,0.39)] bg-[rgba(39,174,96,0.15)] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-[2px]">
                    <AlertCircle className="h-5 w-5 text-[#020816] dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#020816] dark:text-white">
                      Takes effect immediately
                    </p>
                    <p className="text-sm text-[#454545] dark:text-[#a3a3a3]">
                      This change will take effect immediately and you will be
                      charged from the wallet.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfirmChecked((prev) => !prev)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] border px-4 py-4 text-left",
                  "bg-[rgba(37,48,240,0.07)] border-[rgba(37,48,240,0.1)]",
                  "dark:bg-[rgba(255,255,255,0.04)] dark:border-white/40",
                  confirmChecked &&
                    "border-[#2530f0] bg-[rgba(37,48,240,0.12)] dark:bg-white/10"
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-[6px] border",
                    confirmChecked
                      ? "border-[#020816] bg-[#020816] text-white dark:border-white dark:bg-white"
                      : "border-[#020816]/40 bg-transparent dark:border-white/60"
                  )}
                >
                  {confirmChecked && (
                    <Check className="h-3 w-3 text-white dark:text-[#140947]" />
                  )}
                </div>
                <p className="text-sm font-semibold text-[#020816] dark:text-white">
                  I Understand, Confirm Apply
                </p>
              </button>
            </>
          )}
        </div>

        {/* Footer buttons – using shared Button exactly, no color overrides */}
        <DialogFooter className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className="w-full sm:w-auto"
          >
            {submitting ? "Applying..." : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
