"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { roundTo, formatUsd, isFiniteNumber } from "../utils";

import type { BillingPlan } from "../data/billing";
import type { EstimateData, TotalEstimate } from "../types";

type CostSummaryVariant = "default" | "small";

type Props = {
  isResize: boolean;
  billingPlan: BillingPlan;
  handleEstimate: () => void;
  estimateData: EstimateData | null;
  isEstimating: boolean;
  cpuLabel?: string;
  storageLabel?: string;
  variant?: CostSummaryVariant;
};

const CostSummary = ({
  isResize,
  billingPlan,
  handleEstimate,
  estimateData,
  isEstimating,
  cpuLabel,
  storageLabel,
  variant = "default",
}: Props) => {
  const getPlanKey = (): keyof TotalEstimate =>
    billingPlan === "hourly"
      ? "pricePerHour"
      : billingPlan === "daily"
        ? "pricePerDay"
        : "pricePerMonth";

  const getDisplayPrice = (resource: "instance" | "storage" | "total") => {
    if (isEstimating) return "...";
    if (!estimateData) return "-";

    const planKey = getPlanKey();

    if (resource === "total") {
      const rawInstance = estimateData.instance?.[planKey];
      const rawStorage = estimateData.storage?.[planKey];

      if (isFiniteNumber(rawInstance) && isFiniteNumber(rawStorage)) {
        const total = roundTo(rawInstance, 2) + roundTo(rawStorage, 2);
        return formatUsd(total, 2);
      }

      const rawTotal = estimateData.total?.[planKey];
      return isFiniteNumber(rawTotal) ? formatUsd(rawTotal, 2) : "-";
    }

    const raw = estimateData[resource]?.[planKey];
    return isFiniteNumber(raw) ? formatUsd(raw, 2) : "-";
  };

  const storageLeftLabel = storageLabel
    ? storageLabel
    : isResize
      ? "Storage (SSD) (current)"
      : "Storage (SSD)";

  const cpuLeftLabel = cpuLabel ?? "CPU + Memory";

  const cpuRightValue = getDisplayPrice("instance");
  const storageRightValue = getDisplayPrice("storage");
  const totalRightValue = getDisplayPrice("total");

  const bottomNote = isResize
    ? "Changes take a few minutes. You'll see the new CPU once the PC starts again."
    : "PC Resizing - is available on the Hourly plan only. Some changes require the PC to be stopped.";

  if (variant === "small") {
    return (
      <section className="flex h-full flex-col gap-3">
        <div className="space-y-0.5">
          <h2 className="font-space-grotesk text-[16px] font-semibold leading-[18px] text-[#020816] dark:text-white">
            Summary
          </h2>
          {/* <p className="hidden text-[12px] leading-[16px] text-[#64748b] dark:text-[color:var(--paragraph,#b9c2d5)] sm:block">
            Estimated cost based on your selections.
          </p> */}
        </div>
  
        <div className="rounded-[14px] border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-2 dark:border-white/10">
              <span className="text-[14px] leading-[16px] text-[#64748b] dark:text-[color:var(--paragraph,#b9c2d5)]">
                {cpuLeftLabel}
              </span>
              <span
                className="text-right font-space-grotesk text-[14px] font-semibold leading-[18px] text-slate-900 dark:text-white"
                data-testid="sensepc-cpu-price"
              >
                {cpuRightValue}
              </span>
            </div>
  
            <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-2 dark:border-white/10">
              <span className="text-[14px] leading-[16px] text-[#64748b] dark:text-[color:var(--paragraph,#b9c2d5)]">
                {storageLeftLabel}
              </span>
              <span
                className="text-right font-space-grotesk text-[14px] font-semibold leading-[18px] text-slate-900 dark:text-white"
                data-testid="sensepc-storage-price"
              >
                {storageRightValue}
              </span>
            </div>
  
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <span className="text-[14px] font-semibold leading-[16px] text-slate-900 dark:text-white">
                Total
              </span>
              <span
                className="text-right font-space-grotesk text-[15px] font-semibold leading-[18px] text-slate-900 dark:text-white"
                data-testid="sensepc-total-price"
              >
                {totalRightValue}
              </span>
            </div>
          </div>
        </div>
  
        <Button
          type="button"
          onClick={handleEstimate}
          disabled={isEstimating}
          className={cn(
            "h-9 w-full rounded-full px-3 inline-flex items-center justify-center gap-1.5",
            "font-inter font-medium text-[14px] leading-[18px]",
            "bg-gradient-to-l from-[#a801ba] to-[#2530f0] text-white border-0",
            "hover:opacity-90 disabled:opacity-80"
          )}
        >
          {isEstimating ? "Estimating..." : "Refresh Estimate"}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
  
        <div
          className={cn(
            "rounded-[12px] border px-2.5 py-2 text-center",
            "font-inter text-[12px] leading-[16px]",
            "bg-slate-50/80 border-slate-200/80 text-slate-500",
            "dark:bg-white/[0.03] dark:border-white/10 dark:text-[color:var(--paragraph,#b9c2d5)]"
          )}
        >
          <p>Estimates are approximate and may vary at runtime.</p>
          <p className="mt-1">{bottomNote}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col">
      <div className="flex-1 space-y-3">
        <div className="space-y-0">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 py-2 dark:border-white/10">
            <span className="font-inter text-[13px] leading-[20px] text-slate-500 dark:text-[color:var(--paragraph,#b9c2d5)]">
              {cpuLeftLabel}
            </span>
            <span
              className="text-right font-space-grotesk text-[16px] font-semibold leading-[20px] text-slate-900 dark:text-white"
              data-testid="sensepc-cpu-price"
            >
              {cpuRightValue}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 py-2 dark:border-white/10">
            <span className="font-inter text-[13px] leading-[20px] text-slate-500 dark:text-[color:var(--paragraph,#b9c2d5)]">
              {storageLeftLabel}
            </span>
            <span
              className="text-right font-space-grotesk text-[16px] font-semibold leading-[20px] text-slate-900 dark:text-white"
              data-testid="sensepc-storage-price"
            >
              {storageRightValue}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <span className="font-inter text-[13px] font-semibold leading-[20px] text-slate-900 dark:text-white">
              Total
            </span>
            <span
              className="text-right font-space-grotesk text-[17px] font-semibold leading-[22px] text-slate-900 dark:text-white"
              data-testid="sensepc-total-price"
            >
              {totalRightValue}
            </span>
          </div>
        </div>

        <div className="h-px bg-slate-200/80 dark:bg-white/10" />

        <div className="space-y-2.5">
          <Button
            type="button"
            size="lg"
            onClick={handleEstimate}
            disabled={isEstimating}
            className={cn(
              "h-10 w-full rounded-full px-4 inline-flex items-center justify-center gap-1.5",
              "font-inter font-medium text-[13px] leading-[20px]",
              "bg-gradient-to-l from-[#a801ba] to-[#2530f0] text-white border-0",
              "hover:opacity-90 disabled:opacity-80"
            )}
          >
            {isEstimating ? "Estimating..." : "Refresh Estimate"}
            <ArrowUpRight className="h-4 w-4" />
          </Button>

          <p
            className={cn(
              "font-inter text-center text-slate-500 dark:text-[color:var(--paragraph,#b9c2d5)]",
              "text-[12px] leading-[18px]"
            )}
          >
            Estimates are approximate and may vary at runtime.
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-3 rounded-[14px] border px-3 py-2.5 text-center",
          "font-inter text-[12px] leading-[18px]",
          "bg-slate-50/80 border-slate-200/80 text-slate-500",
          "dark:bg-white/[0.03] dark:border-white/10 dark:text-[color:var(--paragraph,#b9c2d5)]"
        )}
      >
        {bottomNote}
      </div>
    </section>
  );
};

export default CostSummary;