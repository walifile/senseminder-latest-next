"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";

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
};

const StoragePlansDialog: React.FC<StoragePlansDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [storageTier, setStorageTier] = useState(1);
  const [selectedServer, setSelectedServer] = useState("us-east");
  const [latencyMap, setLatencyMap] = useState<Record<string, number>>({});
  const [latencyLoading, setLatencyLoading] = useState(true);

  const serverLocations = [{ id: "us-east", name: "East Coast" }];

  const PING_TARGETS = useMemo<Record<string, string>>(
    () => ({
      "us-east": "default",
    }),
    []
  );

  const PRICE_TIER_1 = 0.25;
  const PRICE_PER_TIER = 0.5;
  
  const getStorageSizeFromTier = (tier: number) => `${tier * 20} GB`;
  
  const price =
    storageTier === 1 ? PRICE_TIER_1 : (storageTier - 1) * PRICE_PER_TIER;  

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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

              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger className="rounded-[10px] text-black dark:text-white text-base font-semibold font-['Inter'] leading-6">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {serverLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          <span>{loc.name}</span>
                        </div>
                        <span className="text-xs text-[#454545] dark:text-muted-foreground ml-1">
                          {latencyLoading
                            ? "..."
                            : latencyMap[loc.id] > 0
                              ? `~${latencyMap[loc.id]}ms`
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
