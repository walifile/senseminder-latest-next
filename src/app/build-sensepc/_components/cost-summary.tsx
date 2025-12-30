
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

type CostSummaryVariant = "default" | "small";

type Props = {
  isResize: boolean;
  billingPlan: string;
  handleEstimate: () => void;
  estimateData: estimateDataType | null;
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

  variant = "default",
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

  // Shared values (same logic)
  const storageLeftLabel = isResize ? "Storage (SSD) (current)" : "Storage (SSD)";
  const cpuRightValue = getPrice("instance");
  const storageRightValue = getPrice("storage");
  const totalRightValue = getPrice("total");

  // Small variant needs this exact string behavior
  const bottomNote = isResize
    ? "Changes take a few minutes. You'll see the new CPU once the PC starts again."
    : "Resizing is available on the Hourly plan only. Some changes require the PC to be stopped.";


  if (variant === "small") {
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
            "bg-[#E6E8FF]",

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
                  CPU + Memory
                </span>
                <span
                  className={cn(
                    "font-inter font-semibold",
                    "text-[16px] leading-[24px] tracking-[-0.3px]",
                    "text-[#020816] dark:text-white text-right"
                  )}
                  data-testid="sensepc-cpu-price"
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
                  data-testid="sensepc-storage-price"
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
                    data-testid="sensepc-total-price"
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
  }

  return (
    <div className="w-full md:col-span-4 lg:col-span-5">
      <PublicCard
        className={cn(
          "relative overflow-hidden px-5 md:px-6 py-5 md:py-6",
          "rounded-[20px] border",
          "space-y-5"
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
                "text-[24px] leading-[32px] md:text-[32px] md:leading-[42px]"
              )}
            >
              Cost Summary &amp; Estimate
            </h2>
            <p
              className={cn(
                "font-inter text-[#7d7d7d] dark:text-[color:var(--paragraph,#b9c2d5)]",
                // Figma: 16 / 24
                "text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]"
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
              "text-[16px] leading-[28px] md:text-[18px] md:leading-[32px]"
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
                "font-inter font-medium text-[16px] leading-[24px]",
                "bg-gradient-to-l from-[#a801ba] to-[#2530f0] text-white border-0",
                "hover:opacity-90 disabled:opacity-80"
              )}
            >
              {isEstimating ? "Estimating..." : "Refresh Estimate"}
              <ArrowUpRight className="h-4 w-4" />
            </Button>

            <p
              className={cn(
                "font-inter text-[#7d7d7d] dark:text-[color:var(--paragraph,#b9c2d5)] text-center",
                "text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]"
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
              "dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.1)] dark:text-[color:var(--paragraph,#b9c2d5)]"
            )}
          >
            {isResize ? (
              <>
                Changes take a few minutes. You&apos;ll see the new CPU once the
                PC starts again.
              </>
            ) : (
              <>
                Resizing is available on the Hourly plan only. Some changes
                require the PC to be stopped.
              </>
            )}
          </div>
        </div>
      </PublicCard>
    </div>
  );
};

export default CostSummary;

