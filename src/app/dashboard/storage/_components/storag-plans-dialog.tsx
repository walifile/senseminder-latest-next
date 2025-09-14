"use client";

import React, { useState, useEffect } from "react";

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

  const API_KEY = process.env.NEXT_PUBLIC_PING_API_KEY || "";
  const API_URL = process.env.NEXT_PUBLIC_PING_API_URL || "";

  const serverLocations = [{ id: "us-east", name: "US East (N. Virginia)" }];

  const PING_ENDPOINTS: Record<string, string> = {
    "us-east": API_URL,
  };

  const getStorageSizeFromTier = (tier: number) => `${tier * 20} GB`;
  const PRICE_PER_TIER = 0.5;
  const price = storageTier === 1 ? 0 : (storageTier - 1) * PRICE_PER_TIER;

  const fetchLatencies = async () => {
    setLatencyLoading(true);
    const results: Record<string, number> = {};
    for (const [region, url] of Object.entries(PING_ENDPOINTS)) {
      const start = performance.now();
      try {
        const res = await fetch(url, {
          cache: "no-store",
          headers: { "x-api-key": API_KEY },
        });
        await res.json();
        const end = performance.now();
        results[region] = Math.round(end - start);
      } catch {
        results[region] = -1;
      }
    }
    setLatencyMap(results);
    setLatencyLoading(false);
  };

  useEffect(() => {
    fetchLatencies();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Storage Plan</DialogTitle>
          <DialogDescription>
            No fixed plans — pay only for your highest tier usage each month
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div>
            <h3 className="text-sm font-medium">Storage Tier</h3>
            <div className="flex justify-between mt-1 mb-2">
              <span className="text-muted-foreground text-xs">T-1 (20GB)</span>
              <span className="text-muted-foreground text-xs">
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
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm">
                Selected: <strong>T-{storageTier}</strong> (
                {getStorageSizeFromTier(storageTier)})
              </span>
              <span className="text-l font-semibold">
                {storageTier === 1 ? "FREE" : `$${price.toFixed(2)}`} / month
              </span>
            </div>
          </div>

          <TooltipProvider>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <h3 className="text-sm font-medium">Data Center Location</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-primary drop-shadow-sm cursor-pointer hover:drop-shadow-md transition-all duration-150" />
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
                <SelectTrigger className="w-full">
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
                        <span className="text-xs text-muted-foreground">
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
          <Button variant="default" className="w-full" onClick={fetchLatencies}>
            Test Latency
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoragePlansDialog;
