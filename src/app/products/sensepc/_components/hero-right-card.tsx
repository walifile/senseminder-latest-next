

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

      <div className="relative z-10 flex flex-col gap-5 lg:min-h-[470px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[14px] leading-5 tracking-[-0.2px] text-[#454545] dark:text-[#A3A3A3]">
              Live Preview
            </p>
            <p className="text-[16px] leading-6 tracking-[-0.3px] font-semibold text-[#020816] dark:text-white">
              Your SensePC
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
              Cloud Desktop
            </span>
          </div>
        </div>

        {/* Window */}
        <div className="w-full overflow-hidden rounded-[8px]">
          {/* Window header bar */}
          <div
            className={cn(
              "flex h-8 items-center justify-between px-5 py-1",
              "text-[14px] leading-5 tracking-[-0.2px] text-[#B9C2D5]",
              // light
              "bg-[#2530F0]",
              // dark
              "dark:bg-[#000624]"
            )}
          >
            <span>SensePC-Workspace</span>
            <span className="text-[#B9C2D5]">
              <span className="font-medium text-[#74FFFF]">Connected</span>
              <span>{` · 12 ms`}</span>
            </span>
          </div>

          {/* Window body */}
          <div
            className={cn(
              "flex items-center justify-center",
              "px-8 py-10 sm:px-10 lg:px-[107px] lg:py-[58px]",
              // light
              "bg-[#E4EDFF]",
              // dark
              "dark:bg-[#160E47]"
            )}
          >
            <div className="flex w-[254px] flex-col items-center gap-4 text-center">
              <div className="relative h-[70px] w-[70px] overflow-hidden">
                <img
                  alt=""
                  aria-hidden="true"
                  src={LIGHT.cloudComputing}
                  className="block h-full w-full dark:hidden"
                />
                <img
                  alt=""
                  aria-hidden="true"
                  src={DARK.cloudComputing}
                  className="hidden h-full w-full dark:block"
                />
              </div>

              <p className="text-[18px] leading-8 tracking-[-0.3px] text-[#020816] dark:text-white">
                Stream a full desktop from the cloud — instantly.
              </p>
            </div>
          </div>
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
              Scalable CPU, RAM, and SSD tuned for your workloads.
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
              Encrypted storage and controlled entry points, by default.
            </p>
          </ProductInfoCard>
        </div>
      </div>
    </div>
  );

export default HeroRightCard;
