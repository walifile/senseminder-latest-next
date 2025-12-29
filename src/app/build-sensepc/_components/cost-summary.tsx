
// src/app/build-sensepc/_components/cost-summary.tsx

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PublicCard } from "@/components/ui/public-card";

import { ArrowUpRight } from "lucide-react";

type totalType = {
  pricePerHour?: number;
  pricePerDay?: number;
  pricePerMonth?: number;
};

type estimateDataType = {
  instance: totalType;
  storage: totalType;
  total: totalType;
};

type Props = {
  isResize: boolean;
  billingPlan: string;
  handleEstimate: () => void;
  estimateData: estimateDataType | null;
  isEstimating: boolean;
  cpuLabel?: string;
  storageLabel?: string;
};

const CostSummary = ({
  isResize,
  billingPlan,
  handleEstimate,
  estimateData,
  isEstimating,
  // cpuLabel,
  // storageLabel,
}: Props) => {
  /* ----- price helpers (from old code) ----- */
  const getPrice = (resource: "instance" | "storage" | "total") => {
    if (isEstimating) return "...";

    const planKey =
      billingPlan === "hourly"
        ? "pricePerHour"
        : billingPlan === "daily"
        ? "pricePerDay"
        : "pricePerMonth";

  const price = estimateData?.[resource]?.[planKey];

  return price != null ? `$${price.toFixed(2)}` : "-";
  };

  // Left labels (same logic as old code for Storage / Storage (current))
  const storageLeftLabel = isResize ? "Storage (SSD) (current)" : "Storage (SSD)";
  const cpuRightValue = getPrice("instance");
  const storageRightValue = getPrice("storage");  
  const totalRightValue = getPrice("total");

  return (

    <div className="w-full md:col-span-4 lg:col-span-5">
      <PublicCard
        className={cn(
          "relative overflow-hidden px-5 md:px-6 py-5 md:py-6",
          "rounded-[20px] border",
          "space-y-5",
        )}
      >
        <div className="pointer-events-none absolute -left-10 -top-24 dark:hidden">
          <img
            src="/assets/build-sensepc/Ellipse 7.svg"
            alt=""
            className="block h-full w-full max-w-none"
          />
        </div>

        <div className="relative space-y-5">
          {/* Header */}
          <header className="space-y-1.5">
            <h2
              className={cn(
                "font-space-grotesk font-semibold text-[#020816] dark:text-white",
                "text-[24px] leading-[32px] md:text-[32px] md:leading-[42px]",
              )}
            >
              Cost Summary &amp; Estimate
            </h2>
            <p
              className={cn(
                "font-inter text-[#7d7d7d] dark:text-[color:var(--paragraph,#b9c2d5)]",
                // Figma: 16 / 24
                "text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]",
              )}
            >
              See a live, real-time estimate and estimated cost based on your
              selections.
            </p>
          </header>

          {/* Top divider */}
          <div className="h-px bg-[rgba(0,0,0,0.15)] dark:bg-[rgba(255,255,255,0.2)]" />

          {/* Rows */}
          <div
            className={cn(
              "space-y-3 font-space-grotesk font-semibold",
              "text-[16px] leading-[28px] md:text-[18px] md:leading-[32px]",
            )}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.2)]">
              <span className="text-[#7d7d7d] dark:text-[color:var(--paragraph,#b9c2d5)]">
                CPU + Memory
              </span>
              <span className="text-[#020816] dark:text-white text-right">
                {cpuRightValue}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.2)]">
              <span className="text-[#7d7d7d] dark:text-[color:var(--paragraph,#b9c2d5)]">
                {storageLeftLabel}
              </span>
              <span className="text-[#020816] dark:text-white text-right">
                {storageRightValue}
              </span>
            </div>

            {/* Total row */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#7d7d7d] dark:text-[color:var(--paragraph,#b9c2d5)]">
                Total
              </span>
              <span className="text-[#020816] dark:text-white text-right">
                {totalRightValue}
              </span>
            </div>
          </div>

          {/* Divider under rows */}
          <div className="h-px bg-[rgba(0,0,0,0.15)] dark:bg-[rgba(255,255,255,0.2)]" />

          {/* Button + note */}
          <div className="space-y-3">
            <Button
              type="button"
              size="lg"
              onClick={handleEstimate}
              disabled={isEstimating}
              className={cn(
                "w-full rounded-full inline-flex items-center justify-center gap-1.5",
                // Figma: Inter 16 / 24, medium
                "font-inter font-medium text-[16px] leading-[24px]",
                // Figma gradient pill button: from pink to deep blue
                "bg-gradient-to-l from-[#a801ba] to-[#2530f0] text-white border-0",
                "hover:opacity-90 disabled:opacity-80",
              )}
            >
              {isEstimating ? "Estimating..." : "Refresh Estimate"}
              <ArrowUpRight className="h-4 w-4" />
            </Button>

            <p
              className={cn(
                "font-inter text-[#7d7d7d] dark:text-[color:var(--paragraph,#b9c2d5)] text-center",
                // Figma helper text: Inter 16 / 24
                "text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]",
              )}
            >
              Estimates are approximate and may vary at runtime.
            </p>
          </div>

          <div
            className={cn(
              "mt-1 rounded-[10px] px-4 py-3 text-center",
              "font-inter",
              "text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]",
              "bg-[rgba(82,32,222,0.09)] border border-[rgba(37,48,240,0.1)] text-[#7d7d7d]",
              "dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.1)] dark:text-[color:var(--paragraph,#b9c2d5)]",
            )}
          >
            {isResize ? (
              <>
                Changes take a few minutes. You&apos;ll see the new CPU once the
                PC starts again.
              </>
            ) : (
              <>Resizing is available on the Hourly plan only. Some changes require the PC to be stopped.</>
            )}
          </div>
        </div>
      </PublicCard>
    </div>
  );
};

export default CostSummary;
