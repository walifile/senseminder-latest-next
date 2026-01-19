"use client";

import { useGetStoragePricingTierQuery } from "@/api/billing";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { STORAGE_REGIONS, type StorageRegion } from "@/constants/storage-regions";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { Info, Server } from "lucide-react";

type StoragePlansDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRegion: StorageRegion;
  isRegionLocked?: boolean;
  onRegionChange?: (region: StorageRegion) => void;
};

const StoragePlansDialog: React.FC<StoragePlansDialogProps> = ({
  open,
  onOpenChange,
  selectedRegion,
  isRegionLocked = false,
  onRegionChange,
}) => {
  const [storageTier, setStorageTier] = useState(1);
  const [latencyMap, setLatencyMap] = useState<Record<string, number>>({});
  const [latencyLoading, setLatencyLoading] = useState(true);

  const serverLocations = STORAGE_REGIONS;

  const PING_TARGETS = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        STORAGE_REGIONS.map((region) => [region.value, "storage"])
      ),
    []
  );

  const PRICE_TIER_1 = 0.25;
  const PRICE_PER_TIER = 0.5;
  
  const getStorageSizeFromTier = (tier: number) => `${tier * 20} GB`;

  const { data: storagePricingTierResponse } = useGetStoragePricingTierQuery();

  const price = useMemo(() => {
    const tierData = storagePricingTierResponse?.tier;
    if (tierData && Number(tierData.tier) === storageTier) {
      const pricePerGB = Number(tierData.pricePerGB);
      const includedGB = Number(tierData.includedGB);
      if (Number.isFinite(pricePerGB) && Number.isFinite(includedGB)) {
        return pricePerGB * includedGB;
      }
    }
    return storageTier === 1 ? PRICE_TIER_1 : (storageTier - 1) * PRICE_PER_TIER;
  }, [storagePricingTierResponse, storageTier]);

  const fetchLatencies = useCallback(async () => {
    setLatencyLoading(true);
    const results: Record<string, number> = {};
    for (const [region, target] of Object.entries(PING_TARGETS)) {
      const start = performance.now();
      try {
        const res = await fetch(`/api/ping?target=${target}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Ping request failed");
        }
        await res.json();
        const end = performance.now();
        results[region] = Math.round(end - start);
      } catch {
        results[region] = -1;
      }
    }
    setLatencyMap(results);
    setLatencyLoading(false);
  }, [PING_TARGETS]);

  useEffect(() => {
    fetchLatencies();
  }, [fetchLatencies]);

  useEffect(() => {
    if (storagePricingTierResponse?.tier?.tier) {
      setStorageTier(Number(storagePricingTierResponse.tier.tier));
    }
  }, [storagePricingTierResponse]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="dashboard-sense-cloud-storage-plans-dialog"
        className="sm:max-w-[600px]"
      >
        <DialogHeader>
          <DialogTitle>Storage Plan</DialogTitle>
          <DialogDescription>
            No fixed plans — pay only for your highest tier usage each month
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <h3 className="self-stretch justify-start text-black dark:text-white text-lg font-medium font-['Inter'] leading-7">Storage Tier</h3>
            <div className="self-stretch flex flex-col justify-start items-end gap-2">
              <div className="self-stretch inline-flex justify-between items-center">
                  <span className="justify-start text-[#454545] dark:text-[#B8C2D5] text-sm font-normal font-['Inter'] leading-5">
                  T-1 (20GB)
                </span>
                <span className="justify-start text-[#454545] dark:text-[#B8C2D5] text-sm font-normal font-['Inter'] leading-5">
                  T-50 (1000GB)
                </span>
              </div>
              <Slider
                value={[storageTier]}
                onValueChange={(value) => setStorageTier(value[0])}
                min={1}
                max={50}
                step={1}
              />
              <div className="w-full flex justify-between items-center">
                <span>
                  <span className="text-[#020816] dark:text-white text-base font-semibold font-['Inter'] leading-6">Selected:</span>
                  <span className="text-[#454545] dark:text-[#A3A3A3] text-base font-semibold font-['Inter'] leading-6 ml-1">T-{storageTier} ({ getStorageSizeFromTier(storageTier) })</span>
                </span>
                <span>
                  <span className="text-[#020816] dark:text-white text-base font-semibold font-['Inter'] leading-6">
                    $ {price.toFixed(2)}
                  </span>
                  <span className="text-[#454545] dark:text-[#A3A3A3] text-base font-semibold font-['Inter'] leading-6">
                    {" "}
                    / month
                  </span>
                </span>
              </div>
            </div>
          </div>

          <TooltipProvider>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <h3 className="justify-start text-[#454545] dark:text-[#B8C2D5] text-sm font-normal font-['Inter'] leading-5">Data Center Location</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-[#454545] dark:text-[#B8C2D5] drop-shadow-sm cursor-pointer hover:drop-shadow-md transition-all duration-150" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs text-xs text-yellow-600"
                  >
                    The latency indicates the estimated response time from your
                    current location to each data center. Lower latency usually
                    means better performance.
                  </TooltipContent>
                </Tooltip>
              </div>

              <Select
                value={selectedRegion}
                onValueChange={(value) =>
                  onRegionChange?.(value as StorageRegion)
                }
                disabled={isRegionLocked || !onRegionChange}
              >
                <SelectTrigger className="rounded-[10px] text-black dark:text-white text-base font-semibold font-['Inter'] leading-6">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {serverLocations.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          <span>{loc.label}</span>
                        </div>
                        <span className="text-xs text-[#454545] dark:text-muted-foreground ml-1">
                          {latencyLoading
                            ? "..."
                            : latencyMap[loc.value] > 0
                              ? `~${latencyMap[loc.value]}ms`
                              : "N/A"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipProvider>
        </div>

        <DialogFooter>
          <Button variant="default" size="lg" className="w-full" onClick={fetchLatencies}>
            Test Latency
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoragePlansDialog;
