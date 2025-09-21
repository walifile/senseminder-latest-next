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
  estimateData: estimateDataType;
  isEstimating: boolean;
};

const CostSummary = ({
  isResize,
  billingPlan,
  handleEstimate,
  estimateData,
  isEstimating,
}: Props) => {
  /* ----- price helpers ----- */
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
  return (
    <aside className="md:col-span-4 space-y-4">
      <div className="rounded-lg border bg-card text-card-foreground">
        <div className="p-4 border-b">
          <h4 className="text-sm font-semibold">Summary</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Estimated cost based on your selections.
          </p>
        </div>
        <div className="p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>CPU</span>
            <span className="font-medium">{getPrice("instance")}</span>
          </div>
          <div className="flex justify-between">
            <span>Storage{isResize ? " (current)" : ""}</span>
            <span className="font-medium">{getPrice("storage")}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>Total</span>
            <span>{getPrice("total")}</span>
          </div>

          <div className="pt-3">
            <Button
              type="button"
              onClick={handleEstimate}
              disabled={isEstimating}
              className="w-full"
            >
              {isEstimating ? "Estimating..." : "Refresh Estimate"}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Estimates are approximate and may vary at runtime.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-muted/30 text-muted-foreground p-3 text-xs">
        {isResize ? (
          <>
            Changes take a few minutes. You’ll see the new CPU once the PC
            starts again.
          </>
        ) : (
          <>You can resize later. Some changes require the PC to be stopped.</>
        )}
      </div>
    </aside>
  );
};

export default CostSummary;
