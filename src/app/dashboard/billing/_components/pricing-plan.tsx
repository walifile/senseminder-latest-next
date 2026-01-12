"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useGetStoragePricingTierQuery } from "@/api/billing";

import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

import { Cpu, Server, HardDrive } from "lucide-react";

import { billingPlans } from "../data";

const ICON_SRC = {
  hourly: "/assets/dashboard/hourly-icon.svg",
  daily: "/assets/dashboard/daily-icon.svg",
  monthly: "/assets/dashboard/monthly-icon.svg",
} as const;

function getPlanIconSrc(planName?: string) {
  const key = (planName ?? "").toLowerCase();
  if (key.includes("hour")) return ICON_SRC.hourly;
  if (key.includes("day")) return ICON_SRC.daily;
  if (key.includes("month")) return ICON_SRC.monthly;
  return ICON_SRC.daily;
}

type PlanIconProps = {
  src: string;
  size: number;
};

function PlanIcon({ src, size }: PlanIconProps) {
  return (
    <img
      src={src}
      alt=""
      className="block shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

const PricingPlan = () => {
  const [selectedService, setSelectedService] = useState("smartpc");

  const [storageTier, setStorageTier] = useState<number>(1);
  const [selectedServer, setSelectedServer] = useState("us-east");

  // ✅ follow develop "info"
  const serverLocations = [{ id: "us-east", name: "New York" }];

  // ✅ develop pricing logic
  const PRICE_TIER_1 = 0.25;
  const PRICE_PER_TIER = 0.5;

  const getStorageSizeFromTier = (tier: number) => `${tier * 20} GB`;

  const price =
    storageTier === 1 ? PRICE_TIER_1 : (storageTier - 1) * PRICE_PER_TIER;

  const { data: storagePricingTierResponse } = useGetStoragePricingTierQuery();

  useEffect(() => {
    if (storagePricingTierResponse) {
      setStorageTier(Number(storagePricingTierResponse.tier.tier));
    }
  }, [storagePricingTierResponse]);

  const defaultPlanId = useMemo(() => {
    const daily =
      billingPlans.find((p) => p.name?.toLowerCase() === "daily") ?? null;
    return daily?.id ?? billingPlans[0]?.id ?? null;
  }, []);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    defaultPlanId
  );

  const selectedPlan = useMemo(
    () =>
      billingPlans.find((p) => p.id === selectedPlanId) ??
      billingPlans[0] ??
      null,
    [selectedPlanId]
  );

  return (
    <DashboardCard
      data-testid="dashboard-billing-pricing-plan"
      className={cn(
        "relative overflow-hidden p-0 rounded-[20px]",
        "backdrop-blur-[32px] backdrop-filter",
        "font-['Space_Grotesk']" // ✅ apply font to everything inside
      )}
    >
      <Tabs
        value={selectedService}
        onValueChange={setSelectedService}
        variant="glowing"
        className="w-full"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 px-6 pt-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="justify-start text-2xl font-bold leading-8">
              Only pay for what you use
            </p>
            <p className="text-[16px] leading-6 tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5]">
              Choose your service and preferred billing cycle
            </p>
          </div>

          {/* Service selection (pill) */}
          <TabsList className="font-bold">
            <TabsTrigger value="smartpc">
              <Cpu className="h-3 w-3" />
              Sense PC
            </TabsTrigger>

            <TabsTrigger value="smartstorage">
              <HardDrive className="h-3 w-3" />
              Sense Cloud
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Header divider */}
        <div className="mt-4 h-px w-full bg-[rgba(37,48,240,0.2)] dark:bg-[rgba(255,255,255,0.2)]" />

        <div className="px-6 pb-6 pt-5">
          {/* Sense PC */}
          <TabsContent value="smartpc" className="space-y-6">
            <div
              className={cn(
                "grid gap-4",
                "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]",
                "sm:items-stretch"
              )}
            >
              {/* Left list */}
              <div className="flex flex-col gap-4">
                {billingPlans.map((plan) => {
                  const isActive = plan.id === selectedPlanId;
                  const iconSrc = getPlanIconSrc(plan.name);

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={cn(
                        "relative w-full text-left",
                        "flex items-center gap-3 rounded-[10px] px-4 py-3",
                        "border transition-colors",
                        isActive
                          ? "bg-[rgba(37,48,240,0.10)] border-[#2530F0]"
                          : "bg-[rgba(37,48,240,0.07)] border-[rgba(37,48,240,0.10)]",
                        "dark:border-[rgba(255,255,255,0.10)] dark:bg-[rgba(255,255,255,0.03)]",
                        isActive &&
                          "dark:bg-[rgba(37,48,240,0.10)] dark:border-[#2530F0]"
                      )}
                    >
                      <PlanIcon src={iconSrc} size={42} />

                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-[20px] font-semibold leading-[30px] tracking-[-0.3px]",
                            isActive ? "text-[#2530F0]" : "text-foreground"
                          )}
                        >
                          {plan.name}
                        </p>
                        <p className="text-[14px] leading-5 tracking-[-0.2px] text-[#454545] dark:text-[#B9C2D5]">
                          {plan.description}
                        </p>
                      </div>

                      {isActive && (
                        <span
                          aria-hidden
                          className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#2530F0]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right details */}
              <div className="h-full">
                {selectedPlan ? (
                  <div
                    className={cn(
                      "h-full rounded-[10px] border border-[#2530F0]",
                      "bg-[rgba(37,48,240,0.10)]",
                      "px-5 py-6 sm:px-6 sm:py-7",
                      "flex"
                    )}
                  >
                    <div className="my-auto w-full">
                      <div className="flex items-start gap-3 border-b border-[rgba(37,48,240,0.07)] pb-4 dark:border-[rgba(255,255,255,0.10)]">
                        <PlanIcon
                          src={getPlanIconSrc(selectedPlan.name)}
                          size={48}
                        />

                        <div className="min-w-0">
                          <p className="text-[20px] font-semibold leading-[30px] tracking-[-0.3px] text-foreground">
                            {selectedPlan.name}
                          </p>
                          <p className="text-[14px] leading-5 tracking-[-0.2px] text-[#454545] dark:text-[#B9C2D5]">
                            {selectedPlan.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <p className="text-[14px] font-medium leading-[22px] tracking-[-0.2px] text-foreground">
                          What&apos;s included:
                        </p>

                        <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[16px] leading-6 tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5]">
                          {selectedPlan.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <p className="text-[14px] tracking-[-0.2px] text-[#454545] dark:text-[#B9C2D5]">
              <span className="font-semibold text-foreground">
                💡&nbsp;Note:
              </span>{" "}
              If your PC is on an <strong>Hourly Plan</strong>, SSD storage
              charges will continue even after stopping your Sense PC, since the
              disk remains allocated to preserve your data.
            </p>
          </TabsContent>

          {/* Sense Cloud */}
          <TabsContent value="smartstorage" className="space-y-[30px]">
            {/* Storage Tier */}
            <div className="space-y-[10px]">
              <p className="text-[18px] font-semibold leading-8 tracking-[-0.3px] text-foreground">
                Storage Tier
              </p>

              <div className="space-y-[10px]">
                <div className="flex items-center justify-between text-[16px] font-medium leading-6 tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5]">
                  <span>T-1 (20GB)</span>
                  <span className="text-right">T-50 (1000GB)</span>
                </div>

                <div className="w-full">
                  <Slider
                    value={[storageTier]}
                    onValueChange={(value) => setStorageTier(value[0])}
                    min={1}
                    max={50}
                    step={1}
                    variant="blue"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[16px] font-medium leading-6 tracking-[-0.3px] text-foreground">
                  <span>
                    Selected:&nbsp;<strong>T-{storageTier}</strong>&nbsp;(
                    {getStorageSizeFromTier(storageTier)})
                  </span>

                  <span className="sm:text-right">
                    ${price.toFixed(2)}&nbsp;/ month
                  </span>
                </div>
              </div>
            </div>

            {/* Data Center Location */}
            <div className="space-y-[10px]">
              <p className="text-[18px] font-semibold leading-8 tracking-[-0.3px] text-foreground">
                Data Center Location
              </p>

              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger
                  className={cn(
                    "w-full rounded-[10px] px-5 py-4 h-auto",
                    "bg-[rgba(37,48,240,0.07)] border border-[#2530F0]",
                    "dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.20)]"
                  )}
                >
                  <div className="flex w-full items-center gap-[10px] text-[16px] leading-6 tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5]">
                    <Server className="h-[15px] w-[15px] shrink-0" />
                    <SelectValue placeholder="Select a region" />
                  </div>
                </SelectTrigger>

                <SelectContent>
                  {serverLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </DashboardCard>
  );
};

export default PricingPlan;
