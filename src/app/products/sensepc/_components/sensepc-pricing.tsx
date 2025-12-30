

"use client";

import React from "react";
import Image from "next/image";

import { Check } from "lucide-react";

const planCards = [
  {
    tag: "Hourly",
    description: "Unlimited compute usage — pay per hour while running. SSD/storage continues while stopped so your files and settings stay saved.",
    icon: "/assets/product/sensecloud/sec-5-sync-dark.svg",
  },
  {
    tag: "Daily",
    description: "Flat daily rate with up to 10 hours/day included — ideal for a full workday routine.",
    icon: "/assets/product/sensecloud/sec-5-verified-dark.svg",
  },
  {
    tag: "Monthly",
    description: "Flat monthly rate with up to 180 hours/month included — best value for consistent monthly usage.",
    icon: "/assets/product/sensecloud/sec-5-billing-dark.svg",
  },
];

const billingHighlights = [
  "Clear usage history",
  "One wallet for all usage",
  "Hourly plan supports anytime PC resize",
  "SSD pricing that adjusts with your storage needs",
  "Auto-renewal options for PC that need to stay running",
];

const durabilityHighlights = [
  
  "Encrypted volumes for all SensePC",
  "Secure, session-based entry points",
  "Dedicated cloud desktops for every user",
  "Fine-grained access controls and audit-ready logs",
];

const integrationHighlights = [
  "Unified billing for both compute and storage",
  "Storage tiers that adjust as your needs change",
  "Seamless access from inside your SensePC desktops",
];

const SmartStoragePricing = () => (
  <section className="relative py-16 md:py-20">
    <div className="pointer-events-none absolute -left-[346px] bottom-[-140px] h-[680px] w-[680px] rotate-[-11.316deg] rounded-[680px] bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)] opacity-30 blur-[250px] dark:hidden" />
    <div className="pointer-events-none absolute -left-[346px] bottom-[-140px] hidden h-[680px] w-[680px] rotate-[-11.316deg] rounded-[680px] bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)] opacity-50 blur-[250px] dark:block" />
    <div className="pointer-events-none absolute -right-[200px] bottom-[-140px] h-[680px] w-[680px] rotate-[-11.316deg] rounded-[680px] bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)] opacity-30 blur-[250px] dark:hidden" />
    <div className="pointer-events-none absolute -right-[200px] bottom-[-140px] hidden h-[680px] w-[680px] rotate-[-11.316deg] rounded-[680px] bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)] opacity-50 blur-[250px] dark:block" />

    <div className="container mx-auto px-4 md:px-6">
      {/* ✅ items-stretch so both columns share same height */}
      <div className="grid gap-[30px] lg:grid-cols-[1.2fr,0.8fr] lg:items-stretch">
        {/* ✅ Left column: make it flex + h-full so image card can stretch */}
        <div className="flex h-full flex-col gap-[23px]">
          {/* Top left card (fixed height based on content) */}
          <div className="shrink-0 rounded-[16px] bg-[rgba(37,48,240,0.10)] p-[30px] dark:bg-[linear-gradient(163deg,_#170D44_11.73%,_rgba(23,13,68,0.61)_98.26%)]">
            <div className="space-y-3">
              <h2 className="font-['Space_Grotesk'] text-[28px] font-semibold leading-[40px] text-[#0B1220] dark:text-white md:text-[36px] md:leading-[56px] lg:text-[44px]">
                Flexible Plans That Match How You Work
              </h2>

              <p className="font-['Inter'] text-2xl font-normal leading-10 text-[#454545] dark:text-[#B9C2D5]">
                SensePC keeps billing simple. Add funds to your wallet, choose
                how each cloud PC is billed—hourly, daily, or monthly—and see
                precisely where your usage goes
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {planCards.map((plan) => (
                <div
                  key={plan.tag}
                  className="relative rounded-[8px] bg-transparent p-3 text-left
                    before:absolute before:inset-0 before:rounded-[8px] before:p-px before:content-['']
                    before:[background:linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)]
                    before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
                    before:[-webkit-mask-composite:xor]
                    before:[mask-composite:exclude]
                    before:pointer-events-none"
                >
                  <span className="inline-flex items-center text-[14px] font-semibold tracking-[0.4px] text-[#2530F0] dark:text-[#13E1EA]">
                    <span
                      aria-hidden="true"
                      className="mr-1 h-4 w-4 bg-[#2530F0] dark:bg-[#13E1EA]"
                      style={{
                        maskImage: `url(${plan.icon})`,
                        WebkitMaskImage: `url(${plan.icon})`,
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                      }}
                    />
                    {plan.tag}
                  </span>

                  <p className="mt-2 font-['Inter'] text-sm font-normal leading-5 text-[#454545] dark:text-[#B9C2D5]">
                    {plan.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Bottom left image card: flex-1 so it grows to match right column bottom */}
          <div className="relative flex flex-1 items-center justify-center rounded-[16px] bg-[rgba(37,48,240,0.10)] p-6 dark:bg-[rgba(255,255,255,0.07)]">
            <div className="relative h-full w-full">
              <Image
                src="/assets/svg/product/pricing.svg"
                alt="SenseCloud storage illustration"
                fill
                className="object-contain"
                priority={false}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex h-full flex-col gap-[30px]">
          <div className="relative flex flex-col gap-4 rounded-[16px] bg-transparent px-6 py-[20px]
            before:absolute before:inset-0 before:rounded-[16px] before:p-px before:content-['']
            before:[background:linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)]
            before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
            before:[-webkit-mask-composite:xor]
            before:[mask-composite:exclude]
            before:pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#2530F0] dark:text-[#13E1EA]">
                <img alt="" aria-hidden="true" src="/assets/product/sensecloud/sec-5-Union-b-dark.svg" className="h-8 w-8" />
              </span>
              <h3 className="font-['Space_Grotesk'] text-2xl font-semibold leading-8 text-[#0B1220] dark:text-white">
                What You Get:
              </h3>
            </div>

            <ul className="space-y-3 font-['Inter'] text-base font-normal leading-6 text-[#454545] dark:text-[#B9C2D5]">
              {billingHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[2px] inline-flex h-5 w-5 min-w-5 items-center justify-center rounded-full bg-[#13E1EA]">
                    <Check className="h-3 !w-3 text-white" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col gap-4 rounded-[16px] bg-transparent px-6 py-[20px]
            before:absolute before:inset-0 before:rounded-[16px] before:p-px before:content-['']
            before:[background:linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)]
            before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
            before:[-webkit-mask-composite:xor]
            before:[mask-composite:exclude]
            before:pointer-events-none"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#2530F0] dark:text-[#13E1EA]">
                  <img alt="" aria-hidden="true" src="/assets/product/sensecloud/sec-5-verified-b-dark.svg" className="h-8 w-8" />
                </span>
                <h3 className="font-['Space_Grotesk'] text-2xl font-semibold leading-8 text-[#0B1220] dark:text-white">
                  Security & Reliability
                </h3>
              </div>

              <p className="mt-2 font-['Inter'] text-sm font-normal leading-5 text-[#454545] dark:text-white">
                SensePC is built with security and control at the core — not as
                an afterthought.
              </p>
            </div>

            <hr className="border-white/10" />

            <ul className="space-y-3 font-['Inter'] text-base font-normal leading-6 text-[#454545] dark:text-[#B9C2D5]">
              {durabilityHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[2px] inline-flex h-5 w-5 min-w-5 items-center justify-center rounded-full bg-[#13E1EA]">
                    <Check className="h-3 !w-3 text-white" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col gap-4 rounded-[16px] bg-transparent px-6 py-[20px]
            before:absolute before:inset-0 before:rounded-[16px] before:p-px before:content-['']
            before:[background:linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)]
            before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
            before:[-webkit-mask-composite:xor]
            before:[mask-composite:exclude]
            before:pointer-events-none"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#2530F0] dark:text-[#13E1EA]">
                  <img alt="" aria-hidden="true" src="/assets/product/sensecloud/sec-5-sync-b-dark.svg" className="h-8 w-8" />
                </span>
                <h3 className="font-['Space_Grotesk'] text-2xl font-semibold leading-8 text-[#0B1220] dark:text-white">
                  Sense Cloud Integration
                </h3>
              </div>

              <p className="mt-2 font-['Inter'] text-sm font-normal leading-5 text-[#454545] dark:text-white">
                Your desktops and your storage, managed together.
              </p>
            </div>

            <hr className="border-white/10" />

            <ul className="space-y-3 font-['Inter'] text-base font-normal leading-6 text-[#454545] dark:text-[#B9C2D5]">
              {integrationHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[2px] inline-flex h-5 w-5 min-w-5 items-center justify-center rounded-full bg-[#13E1EA]">
                    <Check className="h-3 !w-3 text-white" />
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
