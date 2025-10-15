"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  CalendarDays,
  Clock3,
  Database,
  CreditCard,
  SquareStack,
  Info,
  Check,
} from "lucide-react";

type CpuKey = "4c8g" | "8c16g" | "16c32g";

const CPU_PRESETS: Record<CpuKey, { label: string; hourly: number }> = {
  "4c8g": { label: "Standerd_win10_4core_8gbRam", hourly: 0.2253 },
  "8c16g": { label: "Pro_win10_8core_16gbRam", hourly: 0.465 },
  "16c32g": { label: "Ultra_win10_16core_32gbRam", hourly: 0.92 },
};

const STORAGE_OPTIONS = ["300 GB", "500 GB", "1 TB"] as const;

function currency(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SensePCCost() {
  const [os, setOs] = React.useState("Windows 10");
  const [cpu, setCpu] = React.useState<CpuKey>("4c8g");
  const [region, setRegion] = React.useState("US East (N. Virginia)");
  const [storage, setStorage] = React.useState<(typeof STORAGE_OPTIONS)[number]>(
    "300 GB"
  );

  const hourly = CPU_PRESETS[cpu].hourly;
  const daily = hourly * 24;
  const monthly = hourly * 24 * 30;

  return (
    <section className="relative py-16 md:py-24" aria-label="SensePC Cost Estimator">
      <div className="container">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Check Your Sense PC Cost
          </h2>
          <p className="mt-3 text-paragraph">
            Configure your perfect Sense PC and get instant pricing
          </p>

          {/* Tabs (visual only) */}
          <div className="mt-6 inline-flex rounded-full p-1 bg-muted/60 dark:bg-white/10">
            <button className="px-5 py-2 rounded-full text-white bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)] shadow">
              Sense PC
            </button>
            <button className="px-5 py-2 rounded-full text-foreground/70 dark:text-white/70">
              Storage
            </button>
          </div>
        </div>

        {/* Feature tiles */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              icon: <Clock3 className="h-5 w-5" />,
              t: "Hourly Plan",
              s: "Pay-as-you-go. Billed per hour. SSD billed continuously.",
            },
            {
              icon: <CalendarDays className="h-5 w-5" />,
              t: "Daily Plan",
              s: "Flat daily rate. Billed every 24 hrs regardless of usage.",
            },
            {
              icon: <CreditCard className="h-5 w-5" />,
              t: "Monthly Plan",
              s: "Fixed fee. Auto-renews. Great for always-on PCs.",
            },
            {
              icon: <Database className="h-5 w-5" />,
              t: "SmartStorage",
              s: "First 20GB free. Charges by peak usage tier monthly.",
            },
            {
              icon: <SquareStack className="h-5 w-5" />,
              t: "Billing Units",
              s: "Costs deducted from wallet at each billing cycle.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl p-4",
                "bg-card border border-border shadow-sm",
                "dark:bg-white/5 dark:border-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-8 w-8 rounded-lg text-primary bg-primary/10">
                  {f.icon}
                </div>
                <p className="font-medium">{f.t}</p>
              </div>
              <p className="mt-2 text-sm text-paragraph">{f.s}</p>
            </div>
          ))}
        </div>

        {/* Config + Summary */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left card */}
          <div
            className={cn(
              "rounded-2xl p-6",
              "bg-card border border-border",
              "dark:bg-white/5 dark:border-white/10"
            )}
          >
            <h3 className="text-lg font-semibold">Choose Configurations</h3>

            <div className="mt-6 space-y-5">
              {/* OS */}
              <div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Hourly Plan</p>
                  <Info className="h-4 w-4 opacity-70" />
                </div>
                <p className="text-xs text-paragraph">
                  Pay-as-you-go. Billed per hour. SSD billed continuously.
                </p>
              </div>

              <div>
                <label className="text-sm text-paragraph">Operating System</label>
                <Select value={os} onValueChange={setOs}>
                  <SelectTrigger className="mt-2 h-11 rounded-md bg-background dark:bg-transparent border-input dark:border-white/15">
                    <SelectValue placeholder="Select OS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Windows 10">Windows 10</SelectItem>
                    <SelectItem value="Windows 11">Windows 11</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CPU */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-paragraph">CPU & Memory</label>
                  <Info className="h-4 w-4 opacity-70" />
                </div>
                <Select value={cpu} onValueChange={(v: CpuKey) => setCpu(v)}>
                  <SelectTrigger className="mt-2 h-11 rounded-md bg-background dark:bg-transparent border-input dark:border-white/15">
                    <SelectValue placeholder="Select CPU" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CPU_PRESETS) as CpuKey[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {CPU_PRESETS[k].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-paragraph">Region</label>
                  <Info className="h-4 w-4 opacity-70" />
                </div>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="mt-2 h-11 rounded-md bg-background dark:bg-transparent border-input dark:border-white/15">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US East (N. Virginia)">
                      US East (N. Virginia)
                    </SelectItem>
                    <SelectItem value="US West (Oregon)">US West (Oregon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Storage */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-paragraph">Storage</label>
                  <Info className="h-4 w-4 opacity-70" />
                </div>
                <Select value={storage} onValueChange={(v) => setStorage(v as any)}>
                  <SelectTrigger className="mt-2 h-11 rounded-md bg-background dark:bg-transparent border-input dark:border-white/15">
                    <SelectValue placeholder="Select Storage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORAGE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-paragraph">
                * All prices are in USD and billed by the hour. Monthly estimates are based on 24/7 usage.
              </p>
            </div>
          </div>

          {/* Right card */}
          <div
            className={cn(
              "rounded-2xl p-6",
              "bg-card border border-border",
              "dark:bg-white/5 dark:border-white/10"
            )}
          >
            <h3 className="text-lg font-semibold">Your Configuration</h3>

            <div className="mt-6 space-y-3">
              {[
                { l: "Operating System", v: os },
                { l: "CPU & Memory", v: CPU_PRESETS[cpu].label },
                { l: "Region", v: region },
                { l: "Storage", v: storage },
              ].map((row, i) => (
                <div
                  key={i}
                  className="rounded-lg border text-sm px-4 py-3 bg-muted/60 border-border dark:bg-white/5 dark:border-white/10"
                >
                  <p className="text-xs text-paragraph">{row.l}</p>
                  <p className="font-medium mt-0.5">{row.v}</p>
                </div>
              ))}
            </div>

            {/* Prices */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { l: "Est. Monthly*", v: `$${currency(monthly)}/month` },
                { l: "Est. Daily*", v: `$${currency(daily)}/day` },
                { l: "Est. Hourly*", v: `$${hourly.toFixed(4)}/hr` },
              ].map((p, i) => (
                <div
                  key={i}
                  className="rounded-lg border px-4 py-3 text-sm bg-muted/60 border-border dark:bg-white/5 dark:border-white/10"
                >
                  <p className="text-xs text-paragraph">{p.l}</p>
                  <p className="font-semibold mt-0.5">{p.v}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button className="h-11 flex-1 rounded-full">View Estimate</Button>
              <Button variant="outline" className="h-11 flex-1 rounded-full">
                Build PC
              </Button>
            </div>

            {/* Benefits */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {[
                "Free data transfer",
                "99.9% uptime SLA",
                "Security monitoring",
                "Automated backups",
                "24/7 support",
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-paragraph">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

