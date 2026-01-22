
"use client";

import * as React from "react";
import { useGetEstimateMutation } from "@/api/fileManagerAPI";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
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
  Loader2,
  AlertCircle,
  CalendarDays,
  CalendarClock,
} from "lucide-react";

import { PLAN_COPY, PLAN_ORDER } from "../data/billing";
import { formatUsd, truncateTo, normalizeGB, isFiniteNumber, formatCycleDateUTC } from "../utils";

import type { BillingPlan } from "../data/billing";
import type { BillingCycle, EstimateData } from "../types";




type Props = {
  currentPlan: BillingPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId?: string;
  storageSize?: string | null;
  region?: string | null;
  autoRenewEnabled?: boolean;
  billingCycle?: BillingCycle | null;
  onToggleAutoRenew?: (enabled: boolean) => void | Promise<void>;
  onConfirm: (plan: BillingPlan) => void | Promise<void>;
};

const PLAN_PRIORITY: Record<BillingPlan, number> = {
  hourly: 1,
  daily: 2,
  monthly: 3,
};



export const BillingPlanDialog: React.FC<Props> = ({
  currentPlan,
  open,
  onOpenChange,
  onConfirm,
  configId,
  storageSize,
  billingCycle,
  region,
  autoRenewEnabled,
  onToggleAutoRenew,
}) => {
  const { toast } = useToast?.() ?? { toast: (_: unknown) => {} };

  const [selectedPlan, setSelectedPlan] =
    React.useState<BillingPlan>(currentPlan);
  const [confirmChecked, setConfirmChecked] = React.useState(false);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [getEstimate, estimateResult] = useGetEstimateMutation();
  const { data: estimateData, isLoading: isEstimateLoading } = estimateResult;

  const [uiAutoRenew, setUiAutoRenew] = React.useState<boolean>(
    autoRenewEnabled ?? currentPlan !== "hourly"
  );
  const [showDisableRenewConfirm, setShowDisableRenewConfirm] =
    React.useState(false);

  const retryTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = React.useRef(true);

  React.useEffect(
    () => () => {
      isMountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    },
    []
  );

  const fetchEstimateWithRetry = React.useCallback(
    async (attempt: number = 0) => {
      if (!open) return;
      if (!configId || !storageSize || !region) return;

      try {
        await getEstimate({
          configId,
          storageSize: normalizeGB(storageSize),
          region,
        }).unwrap();
      } catch {
        if (!isMountedRef.current) return;
        if (!open) return;

        if (attempt < 2) {
          const delay = 800 * Math.pow(2, attempt); // 800ms, 1600ms
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            fetchEstimateWithRetry(attempt + 1);
          }, delay);
        }
      }
    },
    [open, configId, storageSize, region, getEstimate]
  );

  React.useEffect(() => {
    if (open) {
      setSelectedPlan(currentPlan);
      setConfirmChecked(false);
      setSubmitting(false);
      setConfirmOpen(false);
      setUiAutoRenew(autoRenewEnabled ?? currentPlan !== "hourly");
      setShowDisableRenewConfirm(false);

      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      fetchEstimateWithRetry(0);
    } else {
      setConfirmOpen(false);
      setSubmitting(false);
      setShowDisableRenewConfirm(false);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    }
  }, [open, currentPlan, autoRenewEnabled, fetchEstimateWithRetry]);

  const isChanging = selectedPlan !== currentPlan;

  const isDowngrade =
    isChanging && PLAN_PRIORITY[selectedPlan] < PLAN_PRIORITY[currentPlan];

  const isUpgrade =
    isChanging && PLAN_PRIORITY[selectedPlan] > PLAN_PRIORITY[currentPlan];

  const confirmNeeded =
    isUpgrade && (selectedPlan === "daily" || selectedPlan === "monthly");

  const canApply = isChanging && (!confirmNeeded || confirmChecked) && !submitting;

  const handleApplyClick = () => {
    if (!canApply) return;
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

  const renderPrice = (plan: BillingPlan): React.ReactNode => {
    if (isEstimateLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    const data = estimateData as EstimateData | undefined;
    const instance = data?.instance;
    const storage = data?.storage;
    if (!instance || !storage) return "-";

    const decimals = plan === "hourly" ? 3 : 2;

    const inst =
      plan === "hourly"
        ? instance.pricePerHour
        : plan === "daily"
        ? instance.pricePerDay
        : instance.pricePerMonth;

    const ssd =
      plan === "hourly"
        ? storage.pricePerHour
        : plan === "daily"
        ? storage.pricePerDay
        : storage.pricePerMonth;

    if (!isFiniteNumber(inst) || !isFiniteNumber(ssd)) return "-";

    // IMPORTANT: recompute total from parts and truncate (ROUND_DOWN) per plan
    const total =
      truncateTo(inst, decimals) + truncateTo(ssd, decimals);

    return formatUsd(total, decimals);
  };

  const cycleEndLabel = formatCycleDateUTC(billingCycle?.endTime);

  const showActiveCycleEnd =
    selectedPlan === currentPlan &&
    (currentPlan === "daily" || currentPlan === "monthly") &&
    Boolean(cycleEndLabel);

  const ConfirmRow = ({ className }: { className?: string }) => {
    const id = React.useId();

    return (
      <div
        className={cn(
          "font-['Space_Grotesk'] flex w-full items-center gap-3 rounded-[10px] border text-left",
          "px-4 py-4 sm:px-4 sm:py-4",
          "bg-[rgba(37,48,240,0.07)] border-[rgba(37,48,240,0.1)]",
          "dark:bg-[rgba(255,255,255,0.04)] dark:border-white/40",
          confirmChecked && "bg-[rgba(37,48,240,0.12)] dark:bg-white/10",
          className
        )}
      >
        <Checkbox
          id={id}
          variant="billing"
          checked={confirmChecked}
          onCheckedChange={(v) => setConfirmChecked(v === true)}
        />

        <label
          htmlFor={id}
          className="cursor-pointer select-none font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white"
        >
          I Understand, Confirm Apply
        </label>
      </div>
    );
  };

  const AutoRenewSection = () => {
    const isCurrent = selectedPlan === currentPlan;
    if (!isCurrent) return null;
    if (selectedPlan !== "daily" && selectedPlan !== "monthly") return null;

    return (
      <div className="mt-5 sm:mt-7 space-y-3">
        <h3 className="font-['Space_Grotesk'] text-base font-semibold tracking-[-0.03em] text-[#020816] dark:text-white">
          Auto-renew
        </h3>

        <button
          type="button"
          onClick={async () => {
            const next = !uiAutoRenew;

            if (!next) {
              setShowDisableRenewConfirm(true);
              return;
            }

            setUiAutoRenew(true);
            if (onToggleAutoRenew) {
              await onToggleAutoRenew(true);
            }
          }}
          className={cn(
            "font-['Space_Grotesk'] flex w-full items-center gap-3 rounded-[10px] border text-left",
            "px-4 py-4 sm:px-4 sm:py-4",
            "bg-[rgba(37,48,240,0.07)]",
            "dark:bg-[rgba(255,255,255,0.04)] dark:border-white/40",
            uiAutoRenew && "bg-[rgba(37,48,240,0.12)] dark:bg-white/10"
          )}
        >
          <Checkbox
            variant="billing"
            checked={uiAutoRenew}
            onCheckedChange={(v) => {
              const next = Boolean(v);

              if (!next) {
                setShowDisableRenewConfirm(true);
                return;
              }

              setUiAutoRenew(true);
              void onToggleAutoRenew?.(true);
            }}
            className="h-5 w-5 rounded-[6px]"
          />

          <p className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
            Enable auto-renew for the next {PLAN_COPY[selectedPlan].label} cycle.
          </p>
        </button>
      </div>
    );
  };

  const showChangeUI = selectedPlan !== currentPlan;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) setConfirmOpen(false);
          onOpenChange(next);
        }}
      >
        <DialogContent
          className={cn(
            "w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-[640px]",
            "max-h-[calc(100dvh-1.5rem)]",
            "flex flex-col overflow-hidden",
            "border-0 rounded-2xl shadow-xl font-['Space_Grotesk']",
            "px-4 py-4 sm:px-10 sm:py-8"
          )}
        >
          {/* TOP */}
          <DialogHeader className="flex shrink-0 flex-row items-start justify-between gap-3 p-0">
            <DialogTitle className="font-['Space_Grotesk'] text-lg sm:text-xl font-semibold tracking-[-0.04em] text-[#020816] dark:text-white">
              Manage Plan
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
                      {renderPrice(selectedPlan)}
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-[#b9c2d5]">
                      {planCopy.unit}
                    </span>
                  </div>

                  <p className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-[#b9c2d5]">
                    {planCopy.tagline}
                  </p>

                  {showActiveCycleEnd && (
                    <div className="flex items-center gap-2 text-xs text-[#454545] dark:text-[#b9c2d5]">
                      <CalendarClock className="h-4 w-4 opacity-80" />
                      <span className="font-['Space_Grotesk']">
                        Current cycle ends: {cycleEndLabel}
                      </span>
                    </div>
                  )}

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

            <div className="mt-5 sm:mt-7 space-y-3">
              {selectedPlan === "hourly" ? (
                <>
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

                  {showChangeUI && isDowngrade && (
                    <div className="rounded-[10px] border border-[rgba(219,135,0,0.35)] bg-[rgba(219,135,0,0.12)] px-4 py-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-[2px] h-5 w-5 text-[#020816] dark:text-white" />
                        <div className="space-y-1">
                          <p className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                            Takes effect after current plan ends
                          </p>
                          <p className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-[#a3a3a3]">
                            This downgrade will apply after your current billing
                            cycle finishes
                            {cycleEndLabel ? ` (ends: ${cycleEndLabel}).` : "."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {showChangeUI && (
                    <>
                      <div
                        className={cn(
                          "rounded-[10px] border px-4 py-4",
                          isDowngrade
                            ? "border-[rgba(219,135,0,0.35)] bg-[rgba(219,135,0,0.12)]"
                            : "border border-[rgba(76,194,108,0.39)] bg-[rgba(39,174,96,0.15)]"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-[2px] h-5 w-5 text-[#020816] dark:text-white" />
                          <div className="space-y-1">
                            <p className="font-['Space_Grotesk'] text-sm font-semibold text-[#020816] dark:text-white">
                              {isDowngrade
                                ? "Takes effect after current plan ends"
                                : "Takes effect immediately"}
                            </p>

                            <p className="font-['Space_Grotesk'] text-sm text-[#454545] dark:text-[#a3a3a3]">
                              {isDowngrade ? (
                                <>
                                  This downgrade will apply after your current
                                  billing cycle finishes
                                  {cycleEndLabel
                                    ? ` (ends: ${cycleEndLabel}).`
                                    : "."}
                                </>
                              ) : (
                                <>
                                  This change will take effect immediately and
                                  you will be charged from the wallet.
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {confirmNeeded && <ConfirmRow />}
                    </>
                  )}
                </>
              )}
            </div>

            <AutoRenewSection />

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
              {selectedPlan === currentPlan
                ? "Current plan"
                : submitting
                ? "Applying..."
                : "Apply"}
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
                {renderPrice(selectedPlan)} {PLAN_COPY[selectedPlan].unit}
              </div>

              {isDowngrade ? (
                <p className="text-sm">
                  This is a downgrade request. It will apply after your current
                  billing cycle
                  {cycleEndLabel ? ` (ends: ${cycleEndLabel}).` : "."}
                </p>
              ) : confirmNeeded ? (
                <p className="text-sm">
                  This change takes effect immediately and will be charged from
                  your wallet.
                </p>
              ) : null}
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

      <Dialog
        open={showDisableRenewConfirm}
        onOpenChange={setShowDisableRenewConfirm}
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
          <DialogHeader className="shrink-0 space-y-2">
            <DialogTitle className="text-lg sm:text-xl font-semibold tracking-[-0.04em]">
              Disable Auto-renew?
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground">
            Disabling auto renew will stop the PC as soon as current plan ends.
            {cycleEndLabel ? ` (Ends: ${cycleEndLabel})` : ""}
          </div>

          <DialogFooter className="mt-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDisableRenewConfirm(false)}
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={async () => {
                setShowDisableRenewConfirm(false);
                setUiAutoRenew(false);

                if (onToggleAutoRenew) {
                  await onToggleAutoRenew(false);
                }

                toast({ description: "Auto-renew disabled." });
              }}
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              Disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
