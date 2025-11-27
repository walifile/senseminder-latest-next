"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useGetEstimateMutation } from "@/api/fileManagerAPI";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";

import { Info, Crown, Loader2, TrendingUp, CheckCircle2 } from "lucide-react";

type TotalEstimate = {
  pricePerHour?: number;
  pricePerDay?: number;
  pricePerMonth?: number;
};

type EstimateData = {
  instance: TotalEstimate;
  storage: TotalEstimate;
  total: TotalEstimate;
};

export type PlanType = "hourly" | "daily" | "monthly";

interface BillingPlanDialogProps {
  currentPlan: PlanType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (plan: PlanType) => void;
  onToggleAutoRenew?: (enabled: boolean) => Promise<void> | void;
  onBlockedCardDeleteAttempt?: () => void;
  configId?: string;
  storageSize?: string;
  region?: string;
  currentPeriodEnd?: string;
  autoRenewEnabled?: boolean;
}

const PLAN_TITLES = {
  hourly: "Hourly",
  daily: "Daily",
  monthly: "Monthly",
} as const;

const PLAN_TAGLINES = {
  hourly:
    "Pay only for what you use — perfect for quick tasks and experiments.",
  daily: "Built for full workdays with predictable cost and extra savings.",
  monthly: "Max savings and zero hassle — the best choice for regular users.",
} as const;

const PLAN_FEATURES = {
  hourly: [
    "Pay only for actual usage",
    "No minimum commitment",
    "Support included",
  ],
  daily: [
    "24-hours continuous access",
    "Up to 15% savings vs hourly",
    "Support included",
  ],
  monthly: [
    "30-days continuous access",
    "Up to 25% savings vs Hourly",
    "Support included",
  ],
} as const;

const PLAN_ICONS = {
  hourly: null as React.ReactNode,
  daily: <TrendingUp className="h-4 w-4" />,
  monthly: <Crown className="h-4 w-4" />,
} as const;

function fmtMoney(n?: number, digits: number = 2) {
  if (n == null) return "-";
  return `$${n.toFixed(digits)}`;
}

function isActive(endIso?: string) {
  if (!endIso) return true;
  return new Date(endIso).getTime() > Date.now();
}

function defersAtEOT(from: PlanType, to: PlanType, currentActive: boolean) {
  if (!currentActive) return false;
  if (from === "monthly") return to === "hourly" || to === "daily";
  if (from === "daily") return to === "hourly";
  return false;
}

function requiresImmediateCharge(
  from: PlanType,
  to: PlanType,
  currentActive: boolean
) {
  if (from === "hourly" && (to === "daily" || to === "monthly")) return true;
  if (from === "daily" && to === "monthly") return true;
  if (!currentActive && (from === "daily" || from === "monthly")) return true;
  return false;
}

function normalizeGB(storageSize?: string) {
  const n = parseFloat((storageSize ?? "").replace(/\s*gb/i, ""));
  return Number.isFinite(n) ? String(n) : "";
}

export const BillingPlanDialog: React.FC<BillingPlanDialogProps> = ({
  currentPlan,
  open,
  onOpenChange,
  onConfirm,
  onToggleAutoRenew,
  configId,
  storageSize,
  region,
  currentPeriodEnd,
  autoRenewEnabled,
}) => {
  const { toast } = useToast?.() ?? { toast: (_: unknown) => {} };
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(currentPlan);
  const [consent, setConsent] = useState(false);
  const [showDisableRenewConfirm, setShowDisableRenewConfirm] = useState(false);
  const [uiAutoRenew, setUiAutoRenew] = useState<boolean>(
    autoRenewEnabled ?? currentPlan !== "hourly"
  );

  const [getEstimate, { data: estimateData, isLoading }] =
    useGetEstimateMutation();

  const currentIsActive = useMemo(
    () => isActive(currentPeriodEnd),
    [currentPeriodEnd]
  );

  // 🔔 New: state for plan-change confirmation dialog
  const [showPlanConfirm, setShowPlanConfirm] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanType | null>(null);

  useEffect(() => {
    if (open && configId && storageSize && region) {
      getEstimate({
        configId,
        storageSize: normalizeGB(storageSize),
        region,
      });
    }
  }, [open, configId, storageSize, region, getEstimate]);

  useEffect(() => {
    if (open) {
      setSelectedPlan(currentPlan);
      setConsent(false);
      setUiAutoRenew(autoRenewEnabled ?? currentPlan !== "hourly");
    }
  }, [open, currentPlan, autoRenewEnabled]);

  const plans: PlanType[] = ["hourly", "daily", "monthly"];

  const getPrice = (plan: PlanType) => {
    if (isLoading)
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (!estimateData) return "-";
    const p = (estimateData as EstimateData).total;
    if (plan === "hourly") return fmtMoney(p?.pricePerHour, 3);
    if (plan === "daily") return fmtMoney(p?.pricePerDay, 2);
    return fmtMoney(p?.pricePerMonth, 2);
  };

  function renderDeferralOrImmediateNote(
    from: PlanType,
    to: PlanType,
    isCurrent: boolean
  ) {
    if (isCurrent) return null;

    const defers = defersAtEOT(from, to, currentIsActive);
    const immediate = requiresImmediateCharge(from, to, currentIsActive);

    if (defers) {
      return (
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <AlertTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" /> Scheduled at period end
          </AlertTitle>
          <AlertDescription className="text-sm">
            Your current {PLAN_TITLES[from]} plan remains active until{" "}
            <strong>dummy date...</strong>. The new plan will start right after.
          </AlertDescription>
        </Alert>
      );
    }

    if (immediate) {
      return (
        <Alert className="border-emerald-500/30 bg-emerald-500/10">
          <AlertTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" /> Takes effect immediately
          </AlertTitle>
          <AlertDescription className="text-sm">
            This change will take effect immediately and you will be charged
            from the wallet.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-muted-foreground/20">
        <AlertTitle className="flex items-center gap-2">
          <Info className="h-4 w-4" /> Current plan
        </AlertTitle>
        <AlertDescription className="text-sm">
          This is your current plan. Explore other tabs to change it.
        </AlertDescription>
      </Alert>
    );
  }

  function confirmDisabled(from: PlanType, to: PlanType) {
    if (to === from) return true; // prevent "no change"
    if (!consent) return true; // require consent only
    return false; // don't block for wallet/card in UI
  }

  const handleConfirmPlanChange = () => {
    if (!pendingPlan) return;
    onConfirm(pendingPlan);
    setShowPlanConfirm(false);
  };

  // Helper to describe what will happen for the pending change
  const renderPlanConfirmBody = () => {
    if (!pendingPlan) return null;

    const defers = defersAtEOT(currentPlan, pendingPlan, currentIsActive);
    const immediate = requiresImmediateCharge(
      currentPlan,
      pendingPlan,
      currentIsActive
    );

    let subtitle = "";
    if (defers) {
      subtitle =
        "Your current plan will stay active until the end of this billing period. The new plan will start automatically after that.";
    } else if (immediate) {
      subtitle =
        "This change will take effect immediately and charges may be applied from your wallet right away based on the new plan.";
    } else {
      subtitle =
        "This change will update your billing behavior for this computer according to the selected plan.";
    }

    return (
      <>
        <p className="text-sm text-muted-foreground">
          You&apos;re changing your billing plan from{" "}
          <strong>{PLAN_TITLES[currentPlan]}</strong> to{" "}
          <strong>{PLAN_TITLES[pendingPlan]}</strong>.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/40 bg-gradient-to-b from-background/90 to-muted/40 shadow-2xl backdrop-blur-xl transition-all">
        <DialogHeader className="space-y-2 pb-2">
          <DialogTitle className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Change Plan
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={selectedPlan}
          onValueChange={(val) => {
            setSelectedPlan(val as PlanType);
            setConsent(false);
          }}
          className="w-full mt-3"
        >
          <TabsList className="grid grid-cols-3 w-full bg-muted/50 rounded-xl p-1 shadow-inner">
            {plans.map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                className="relative py-2.5 rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-muted/30"
              >
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  {PLAN_ICONS[p]}
                  {PLAN_TITLES[p]}
                </div>
                {p === currentPlan && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {plans.map((plan) => {
            const isCurrent = plan === currentPlan;

            return (
              <TabsContent key={plan} value={plan} className="space-y-5 mt-6">
                {/* Price Card */}
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-background to-muted/30 p-6 shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tight text-foreground">
                          {getPrice(plan)}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          /{" "}
                          {plan === "hourly"
                            ? "hour"
                            : plan === "daily"
                            ? "day"
                            : "month"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {PLAN_TAGLINES[plan]}
                      </p>
                    </div>
                    {isCurrent && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </div>
                    )}
                  </div>
                  {/* Owner asks to show when this period ends -> placeholder */}
                  {isCurrent && (plan === "daily" || plan === "monthly") && (
                    <div className="pt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" /> Ends:{" "}
                      <span className="font-medium ml-1">dummy date...</span>
                    </div>
                  )}
                  {!isCurrent && (
                    <div className="pt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" /> Estimated based on your
                      current configuration
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    What's included
                  </h4>
                  <ul className="space-y-3">
                    {PLAN_FEATURES[plan].map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm group"
                      >
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator className="my-4" />

                {/* Notices per transition rule (hidden on active tab) */}
                {renderDeferralOrImmediateNote(currentPlan, plan, isCurrent)}

                {plan === "hourly" && (
                  <Alert className="border-muted-foreground/20">
                    <AlertTitle className="flex items-center gap-2">
                      <Info className="h-4 w-4" /> Hourly billing behavior
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      With Hourly Plan you will not get charged for{" "}
                      <strong>Stopped</strong> computer CPU and Memory. However,
                      SSD charges will continue, since the disk remains
                      allocated to preserve your data.
                    </AlertDescription>
                  </Alert>
                )}

                {!isCurrent && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={`consent-${plan}`}
                        checked={selectedPlan === plan ? !!consent : false}
                        onCheckedChange={(v) =>
                          selectedPlan === plan && setConsent(Boolean(v))
                        }
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={`consent-${plan}`}
                        className="text-sm text-foreground/80 cursor-pointer"
                      >
                        I Understand, Confirm Apply
                      </label>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                {!isCurrent && (
                  <DialogFooter className="gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setPendingPlan(plan);
                        setShowPlanConfirm(true);
                      }}
                      disabled={confirmDisabled(currentPlan, plan)}
                      className="flex-1 sm:flex-none min-w-[140px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:opacity-90 transition-all"
                    >
                      Apply
                    </Button>
                  </DialogFooter>
                )}

                {/* Current plan: Auto-renew (Daily/Monthly only) */}
                {isCurrent && (plan === "daily" || plan === "monthly") && (
                  <div className="mt-6 pt-6 border-t space-y-4">
                    <h4 className="text-sm font-semibold">Auto-renew</h4>
                    <div className="rounded-lg border bg-muted/30 p-4 flex items-start gap-3">
                      <Checkbox
                        id={`autorenew-${plan}`}
                        checked={uiAutoRenew}
                        onCheckedChange={async (v) => {
                          const next = Boolean(v);
                          if (!next) {
                            setShowDisableRenewConfirm(true);
                            return;
                          }
                          setUiAutoRenew(true);
                          if (onToggleAutoRenew) {
                            await onToggleAutoRenew(true);
                          }
                        }}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={`autorenew-${plan}`}
                        className="text-sm text-foreground/80 cursor-pointer"
                      >
                        Enable auto-renew for the next {PLAN_TITLES[plan]}{" "}
                        cycle.
                      </label>
                    </div>

                    <Alert className="border-muted-foreground/20">
                      <AlertDescription className="text-xs leading-relaxed">
                        When enabled, your plan will automatically renew at the
                        end of the current period. You must have at least one
                        saved card. To remove your last card while any
                        auto-renew is enabled, please add another card first.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* 🔔 Plan change confirmation dialog */}
        <Dialog open={showPlanConfirm} onOpenChange={setShowPlanConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm plan change?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              {renderPlanConfirmBody()}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPlanConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPlanChange}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
              >
                Confirm change
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disable Auto-renew consent dialog */}
        <Dialog
          open={showDisableRenewConfirm}
          onOpenChange={setShowDisableRenewConfirm}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Disable Auto-renew?</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground">
              Disabling auto renew will stop the PC as soon as current plan
              ends.
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDisableRenewConfirm(false)}
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
              >
                Disable
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
