"use client";

import React from "react";
import { cn } from "@/lib/utils";
import ProductMiniInfoCard from "./product-mini-info-card";

const ProductInfoCard = ProductMiniInfoCard;

const DARK = {
  ellipse: "/assets/product/hero-rightcard-ellipse-dark.svg",
  cloud: "/assets/product/hero-rightcard-cloud-dark.svg",
  cloudComputing: "/assets/product/hero-rightcard-cloud-computing-dark.svg",
  computer: "/assets/product/hero-rightcard-performance-computer-dark.svg",
  shield: "/assets/product/hero-rightcard-security-shield-dark.svg",
} as const;

const LIGHT = {
  ellipse: "/assets/product/hero-rightcard-ellipse-light.svg",
  cloud: "/assets/product/hero-rightcard-cloud-light.svg",
  cloudComputing: "/assets/product/hero-rightcard-cloud-computing-light.svg",
  computer: "/assets/product/hero-rightcard-performance-computer-light.svg",
  shield: "/assets/product/hero-rightcard-security-shield-light.svg",
} as const;

const HeroRightCard = () => (
  <div
    className={cn(
      "relative overflow-hidden rounded-[20px] p-[30px]",
      "border border-white/20 backdrop-blur-[32px]",
      // light
      "bg-[rgba(37,48,240,0.10)]",
      // dark
      "dark:bg-[rgba(255,255,255,0.03)]"
    )}
  >
    {/* Ellipse: bottom-left */}
    <div
      className="pointer-events-none absolute z-0 left-[-9.75rem] bottom-[-4.9375rem]"
      aria-hidden
    >
      <div className="relative h-[310px] w-[310px]">
        <div className="absolute inset-[-64.52%]">
          <img
            src={LIGHT.ellipse}
            alt=""
            className="block h-full w-full max-w-none dark:hidden"
          />
          <img
            src={DARK.ellipse}
            alt=""
            className="hidden h-full w-full max-w-none dark:block"
          />
        </div>
      </div>
    </div>

    {/* Ellipse: top-right */}
    <div
      className="pointer-events-none absolute z-0 right-[-8.6875rem] top-[-7.8125rem]"
      aria-hidden
    >
      <div className="relative h-[310px] w-[310px]">
        <div className="absolute inset-[-64.52%]">
          <img
            src={LIGHT.ellipse}
            alt=""
            className="block h-full w-full max-w-none dark:hidden"
          />
          <img
            src={DARK.ellipse}
            alt=""
            className="hidden h-full w-full max-w-none dark:block"
          />
        </div>
      </div>
    </div>

    <div className="relative z-10 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[14px] leading-5 tracking-[-0.2px] text-[#454545] dark:text-[#A3A3A3]">
            Storage Snapshot
          </p>
          <p className="text-[16px] leading-6 tracking-[-0.3px] font-semibold text-[#020816] dark:text-white">
            SenseCloud Volume
          </p>
        </div>

        {/* Pill */}
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-[999px] px-2 py-1",
            "border border-[rgba(37,48,240,0.1)]",
            // light
            "bg-[#2530F0]",
            // dark
            "dark:bg-[rgba(32,42,226,0.51)]"
          )}
        >
          <span className="relative h-4 w-4 shrink-0">
            <img
              alt=""
              aria-hidden="true"
              src={LIGHT.cloud}
              className="block h-full w-full dark:hidden"
            />
            <img
              alt=""
              aria-hidden="true"
              src={DARK.cloud}
              className="hidden h-full w-full dark:block"
            />
          </span>
          <span className="text-[14px] leading-5 tracking-[-0.2px] text-white">
            Storage
          </span>
        </div>
      </div>

      {/* Storage card */}
      <div className="w-full overflow-hidden rounded-[16px] bg-[#E6EEFF] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-base leading-7 tracking-[-0.3px] font-semibold text-[#0B1220]">
            Workspace-Storage-01
          </p>
          <div className="inline-flex items-center gap-2 text-[#2530F0]">
            <span className="relative h-5 w-5 shrink-0">
              <img
                alt=""
                aria-hidden="true"
                src={LIGHT.cloud}
                className="block h-full w-full dark:hidden"
              />
              <img
                alt=""
                aria-hidden="true"
                src={DARK.cloud}
                className="hidden h-full w-full dark:block"
              />
            </span>
            <span className="text-[16px] leading-6 tracking-[-0.2px] font-semibold">
              Attached to SensePC
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-[16px] leading-6 tracking-[-0.2px] text-[#454545]">
          <span>Used</span>
          <span className="font-semibold text-[#454545]">320 GB / 1 TB</span>
        </div>

        <div className="mt-3">
          <div className="relative h-[14px] w-full rounded-full bg-[#C9D7FF]">
            <div className="absolute left-0 top-0 h-full w-[32%] rounded-full bg-[#2530F0]" />
            <div className="absolute left-[32%] top-1/2 h-6 w-6 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#2530F0]" />
          </div>
        </div>

        <p className="mt-4 text-[14px] leading-6 tracking-[-0.2px] text-[#52555F]">
          Auto-tiering enabled ? monitoring growth and adjusting billing
          accordingly.
        </p>
      </div>

      {/* Bottom mini cards (shell-only reusable component) */}
      <div className="grid gap-3 md:grid-cols-2">
        <ProductInfoCard className="p-3">
          <div className="mb-1 flex items-center gap-[5px]">
            <span className="relative h-[18px] w-[18px] shrink-0">
              <img
                alt=""
                aria-hidden="true"
                src={LIGHT.computer}
                className="block h-full w-full dark:hidden"
              />
              <img
                alt=""
                aria-hidden="true"
                src={DARK.computer}
                className="hidden h-full w-full dark:block"
              />
            </span>

            <p className="text-[16px] leading-6 tracking-[-0.3px] font-semibold text-[#020816] dark:text-white">
              Performance
            </p>
          </div>

          <p className="text-[14px] leading-5 tracking-[-0.2px] text-[#071432] dark:text-[#B9C2D5]">
            SSD-backed performance tuned for desktop workloads, assets, and
            project files.
          </p>
        </ProductInfoCard>

        <ProductInfoCard className="p-3">
          <div className="mb-1 flex items-center gap-[5px]">
            <span className="relative h-[18px] w-[18px] shrink-0 overflow-hidden">
              <img
                alt=""
                aria-hidden="true"
                src={LIGHT.shield}
                className="block h-full w-full dark:hidden"
              />
              <img
                alt=""
                aria-hidden="true"
                src={DARK.shield}
                className="hidden h-full w-full dark:block"
              />
            </span>

            <p className="text-[16px] leading-6 tracking-[-0.3px] font-semibold text-[#020816] dark:text-white">
              Security
            </p>
          </div>

          <p className="text-[14px] leading-5 tracking-[-0.2px] text-[#071432] dark:text-[#B9C2D5]">
            Encryption, access controls, and versioning support for safer
            storage.
          </p>
        </ProductInfoCard>
      </div>
    </div>
  </div>
);

export default HeroRightCard;
