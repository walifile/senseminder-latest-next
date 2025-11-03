"use client";

import appConfig from "@/config/app-config";
import React, { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

const { PING_API_KEY, PING_API_URL } = appConfig;

const StorageCostCalculator = () => {
  const router = useRouter();
  const [storageTier, setStorageTier] = useState(1);
  const [selectedServer, setSelectedServer] = useState("us-east");
  const [latencyMap, setLatencyMap] = useState<Record<string, number>>({});
  const [latencyLoading, setLatencyLoading] = useState(true);

  const serverLocations = [{ id: "us-east", name: "US East (N. Virginia)" }];

  const PING_ENDPOINTS: Record<string, string> = {
    "us-east": PING_API_URL,
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
          headers: { "x-api-key": PING_API_KEY },
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

  const getStartedURL = () => {
    router.push(routes?.storage);
  };

  return (
    <div
      className={cn(
        "mx-auto max-w-screen-md bg-[#FFFFFF] dark:bg-[#170D44] rounded-2xl p-4 md:p-10 space-y-8",
        "border outline-border before:rounded-[16px]"
      )}
    >
      <div>
        <h2 className="font-space-grotesk font-bold text-2xl">Storage Plan</h2>
        <p className="text-paragraph text-sm">
          No fixed plans - pay only for your highest tier usage each month
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Storage Tier</h3>

            <div className="flex justify-between gap-2">
              <span className="text-paragraph text-sm">T-1 (20GB)</span>
              <span className="text-paragraph text-sm">T-50 (1000GB)</span>
            </div>
          </div>

          <Slider
            value={[storageTier]}
            onValueChange={(value) => setStorageTier(value[0])}
            min={1}
            max={50}
            step={1}
          />

          <div className="flex justify-between items-center gap-2">
            <span className="text-sm md:text-base font-semibold">
              Selected: <strong>T-{storageTier}</strong> (
              {getStorageSizeFromTier(storageTier)})
            </span>

            <span className="text-lg md:text-2xl font-semibold">
              {storageTier === 1 ? "FREE" : `$${price.toFixed(2)}`} / month
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold">Data Center Location</h3>

          <Select value={selectedServer} onValueChange={setSelectedServer}>
            <SelectTrigger className="h-12 px-3 py-5 w-full border outline-border before:rounded-lg">
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>

            <SelectContent>
              {serverLocations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  <p className="text-base font-semibold">
                    {loc.name}
                    {` `}
                    <span className="text-sm text-paragraph">
                      {latencyLoading
                        ? "..."
                        : latencyMap[loc.id] > 0
                        ? `~${latencyMap[loc.id]}ms`
                        : "N/A"}
                    </span>
                  </p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={getStartedURL}>
        Get Started
      </Button>
    </div>
  );
};

export default StorageCostCalculator;
