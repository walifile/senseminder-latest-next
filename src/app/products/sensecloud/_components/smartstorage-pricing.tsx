"use client";

import React from "react";
import Image from "next/image";
import { Check, Link2, ShieldCheck, Sparkles } from "lucide-react";

const planCards = [
  {
    tag: "AUTO-TIERED",
    title: "Adaptive billing",
    description:
      "Monthly billing based on maximum reserved usage in the period.",
  },
  {
    tag: "DEDICATED PLANS",
    title: "Reserved capacity",
    description:
      "Locked-in capacity and pricing for workloads with predictable storage needs.",
  },
  {
    tag: "UNIFIED BILLING",
    title: "One wallet, all usage",
    description:
      "Storage and compute usage flow into a single SensePC wallet.",
  },
];

const billingHighlights = [
  "Auto-tiered pricing based on your highest usage in the billing window.",
  "Dedicated storage plans for predictable workloads and reserved capacity.",
  "Unified wallet and billing with SensePC, no separate invoices.",
  "Transparent usage history with exportable records for compliance.",
];

const durabilityHighlights = [
  "Backed by highly durable cloud object storage primitives.",
  "Multi-AZ awareness and fault-tolerant design at the platform layer.",
  "Data integrity checks and monitoring for silent corruption risks.",
  "Planned future support for cross-region backup and disaster recovery.",
];

const integrationHighlights = [
  "Storage feels native to your cloud desktops.",
  "Attach storage to SmartPCs with clear visibility of size and cost.",
  "Future-friendly design for snapshots, lifecycle policies, and backup workflows.",
  "Centralized management across compute and storage from a single dashboard.",
];

const SmartStoragePricing = () => (
  <section className="relative py-16 md:py-20">
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[20px] border border-[#CFCBFF] bg-[#E9E8FF] p-6 md:p-8 dark:border-[#2A215F] dark:bg-[#0F0B2E]">
          <div className="space-y-3">
            <h2 className="font-[var(--font-space-grotesk)] text-[24px] font-semibold leading-[32px] text-[#0B1220] dark:text-white md:text-[32px] md:leading-[40px]">
              SmartStorage Pricing & Plans
            </h2>
            <p className="text-[14px] leading-6 text-[#454545] dark:text-[#B9C2D5] md:text-[16px]">
              SenseCloud follows the SensePC billing philosophy: simple,
              transparent, and wallet-driven. Auto-tiered plans help optimize
              cost, while dedicated storage plans give you predictable pricing
              and reserved capacity when you need it.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {planCards.map((plan) => (
              <div
                key={plan.tag}
                className="rounded-[12px] border border-[#D6D2FF] bg-[#F6F5FF] p-4 text-left dark:border-[#2A215F] dark:bg-[#16113B]"
              >
                <span className="inline-flex items-center rounded-full bg-[#E7E7FF] px-2 py-1 text-[10px] font-semibold tracking-[0.4px] text-[#2530F0] dark:bg-[#1F1A4A] dark:text-[#13E1EA]">
                  {plan.tag}
                </span>
                <h3 className="mt-3 text-[14px] font-semibold text-[#0B1220] dark:text-white">
                  {plan.title}
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-[#454545] dark:text-[#B9C2D5]">
                  {plan.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center rounded-[16px] bg-[#E0DEFF] p-6 dark:bg-[#160F3D]">
            <Image
              src="/assets/svg/storage.svg"
              alt="SmartStorage illustration"
              width={320}
              height={220}
              className="h-auto w-full max-w-[320px]"
              priority={false}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[16px] border border-[#A801BA] bg-[#F7F6FF] p-5 dark:border-[#A801BA] dark:bg-[#141036]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E7E7FF] text-[#2530F0] dark:bg-[#1F1A4A] dark:text-[#13E1EA]">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="text-[16px] font-semibold text-[#0B1220] dark:text-white">
                Storage Billing Highlights
              </h3>
            </div>
            <ul className="mt-4 space-y-2 text-[13px] leading-5 text-[#454545] dark:text-[#B9C2D5]">
              {billingHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#13E1EA]">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[16px] border border-[#A801BA] bg-[#F7F6FF] p-5 dark:border-[#A801BA] dark:bg-[#141036]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E7E7FF] text-[#2530F0] dark:bg-[#1F1A4A] dark:text-[#13E1EA]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h3 className="text-[16px] font-semibold text-[#0B1220] dark:text-white">
                Durability & Availability
              </h3>
            </div>
            <ul className="mt-4 space-y-2 text-[13px] leading-5 text-[#454545] dark:text-[#B9C2D5]">
              {durabilityHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#13E1EA]">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[16px] border border-[#A801BA] bg-[#F7F6FF] p-5 dark:border-[#A801BA] dark:bg-[#141036]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E7E7FF] text-[#2530F0] dark:bg-[#1F1A4A] dark:text-[#13E1EA]">
                <Link2 className="h-4 w-4" />
              </span>
              <h3 className="text-[16px] font-semibold text-[#0B1220] dark:text-white">
                SensePC Integration
              </h3>
            </div>
            <ul className="mt-4 space-y-2 text-[13px] leading-5 text-[#454545] dark:text-[#B9C2D5]">
              {integrationHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#13E1EA]">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default SmartStoragePricing;
