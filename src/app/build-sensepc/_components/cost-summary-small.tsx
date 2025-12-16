// src/app/build-sensepc/_components/cost-summary-small.tsx

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

  /**
   * Optional configuration labels from the form.
   * If provided, CPU / Storage rows show these labels instead of prices.
   * If omitted, we fall back to the price values.
   */
  cpuLabel?: string;
  storageLabel?: string;
};

const CostSummarySmall = ({
  isResize,
  billingPlan,
  handleEstimate,
  estimateData,
  isEstimating,
  cpuLabel,
  storageLabel,
}: Props) => {
  /* ----- price helpers (same logic as big CostSummary) ----- */
  const getPrice = (resource: "instance" | "storage" | "total") => {
    if (isEstimating) return "...";

    const planKey =
      billingPlan === "hourly"
        ? "pricePerHour"
        : billingPlan === "daily"
        ? "pricePerDay"
        : "pricePerMonth";

    const decimals = billingPlan === "hourly" ? 3 : 2;
    const price = estimateData?.[resource]?.[planKey];

    return price != null ? `$${price.toFixed(decimals)}` : "-";
  };

  // Labels & values (reuse wiring from main cost-summary.tsx)
  const storageLeftLabel = isResize ? "Storage (current)" : "Storage";
  const cpuRightValue = cpuLabel ?? getPrice("instance");
  const storageRightValue = storageLabel ?? getPrice("storage");
  const totalRightValue = getPrice("total");

  // Bottom note: keep the resize / non-resize text behavior
  const bottomNote = isResize
    ? "Changes take a few minutes. You'll see the new CPU once the PC starts again."
    : "You can resize later. Some changes require the PC to be stopped.";

  return (
    <section className="flex flex-col gap-6">
      {/* Header: Summary + subtitle */}
      <div className="space-y-1">
        <h2
          className={cn(
            "font-inter font-semibold",
            "text-[16px] leading-[24px] tracking-[-0.3px]",
            "text-[#020816] dark:text-white"
          )}
        >
          Summary
        </h2>
        <p
          className={cn(
            "font-inter font-normal",
            "text-[14px] leading-[20px] tracking-[-0.2px]",
            "text-[#454545] dark:text-[color:var(--paragraph,#b9c2d5)]"
          )}
        >
          Estimated cost based on your selections.
        </p>
      </div>

<div
  className={cn(
    "relative overflow-hidden",
    "rounded-[16px]",

    // Light mode: solid light card (unchanged)
    "bg-[#E6E8FF]",

    // Dark mode: true Figma gradient + glass
    "dark:bg-transparent", // remove light bg under gradient
    "dark:bg-gradient-to-l",
    "dark:from-[#2530F0]/25 dark:to-[#A801BA]/15", // ⬅ Figma colours
    "dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/20",
    "dark:backdrop-blur-2xl"
  )}
>

        {/* Decorative ellipse (optional subtle glow) */}
        <div
          className="pointer-events-none absolute -right-24 -bottom-32 opacity-60"
          aria-hidden
        >
          <img
            src="/assets/build-sensepc/Ellipse 7.svg"
            alt=""
            className="block h-[260px] w-[260px] max-w-none"
          />
        </div>

        <div className="relative flex flex-col gap-6 p-5">
          {/* CPU / Storage / Total rows */}
          <div className="space-y-[15px]">
            {/* CPU */}
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "font-inter font-normal",
                  "text-[14px] leading-[20px] tracking-[-0.2px]",
                  "text-[#454545] dark:text-[color:var(--paragraph,#b9c2d5)]"
                )}
              >
                CPU
              </span>
              <span
                className={cn(
                  "font-inter font-semibold",
                  "text-[16px] leading-[24px] tracking-[-0.3px]",
                  "text-[#020816] dark:text-white text-right"
                )}
              >
                {cpuRightValue}
              </span>
            </div>

            {/* Storage */}
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "font-inter font-normal",
                  "text-[14px] leading-[20px] tracking-[-0.2px]",
                  "text-[#454545] dark:text-[color:var(--paragraph,#b9c2d5)]"
                )}
              >
                {storageLeftLabel}
              </span>
              <span
                className={cn(
                  "font-inter font-semibold",
                  "text-[16px] leading-[24px] tracking-[-0.3px]",
                  "text-[#020816] dark:text-white text-right"
                )}
              >
                {storageRightValue}
              </span>
            </div>

            {/* Divider + Total */}
            <div className="space-y-2">
              <div className="h-px w-full">
                <div className="h-px w-full bg-black/15 dark:bg-white/20" />
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-inter font-semibold",
                    "text-[14px] leading-[22px] tracking-[-0.2px]",
                    "text-[#020816] dark:text-white"
                  )}
                >
                  Total
                </span>
                <span
                  className={cn(
                    "font-inter font-semibold",
                    "text-[16px] leading-[24px] tracking-[-0.3px]",
                    "text-[#020816] dark:text-white text-right"
                  )}
                >
                  {totalRightValue}
                </span>
              </div>
            </div>
          </div>

          {/* Button + runtime note */}
          <div className="flex flex-col items-center gap-3">
            <Button
              type="button"
              size="lg"
              onClick={handleEstimate}
              disabled={isEstimating}
              className={cn(
                "w-full rounded-full",
                "h-[48px] px-[28px] py-[16px]",
                "bg-gradient-to-l from-[#a801ba] to-[#2530f0]",
                "text-white font-inter font-medium text-[16px] leading-[24px] tracking-[-0.3px]",
                "border-none shadow-none",
                "hover:opacity-90 disabled:opacity-80"
              )}
            >
              {isEstimating ? "Estimating..." : "Refresh Estimate"}
            </Button>

            <p
              className={cn(
                "font-inter font-normal",
                "text-[14px] leading-[20px] tracking-[-0.2px]",
                "text-center",
                "text-[#454545] dark:text-[color:var(--paragraph,#b9c2d5)]"
              )}
            >
              Estimates are approximate and may vary at runtime.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom helper note outside the card */}
      <p
        className={cn(
          "font-inter font-normal",
          "text-[14px] leading-[20px] tracking-[-0.2px]",
          "text-center",
          "text-[#a3a3a3] dark:text-[color:var(--paragraph,#b9c2d5)]"
        )}
      >
        {bottomNote}
      </p>
    </section>
  );
};

export default CostSummarySmall;
