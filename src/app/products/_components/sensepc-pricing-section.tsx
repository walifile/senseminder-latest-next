import React from "react";
import Image from "next/image";

import ProductPricingLayout from "./product-pricing-layout";
import ProductPricingInfoCard from "./product-pricing-info-card";

const planCards = [
  {
    tag: "Hourly",
    description:
      "Unlimited compute usage - pay per hour while running. SSD/storage continues while stopped so your files and settings stay saved.",
    icon: "/assets/product/sensecloud/sec-5-sync-dark.svg",
  },
  {
    tag: "Daily",
    description:
      "Flat daily rate with up to 10 hours/day included - ideal for a full workday routine.",
    icon: "/assets/product/sensecloud/sec-5-verified-dark.svg",
  },
  {
    tag: "Monthly",
    description:
      "Flat monthly rate with up to 180 hours/month included - best value for consistent monthly usage.",
    icon: "/assets/product/sensecloud/sec-5-billing-dark.svg",
  },
];

const infoCards = [
  {
    iconSrc: "/assets/product/sensecloud/sec-5-Union-b-dark.svg",
    title: "What You Get:",
    items: [
      "Clear usage history",
      "One wallet for all usage",
      "Hourly plan supports anytime PC resize",
      "SSD pricing that adjusts with your storage needs",
      "Auto-renewal options for PC that need to stay running",
    ],
  },
  {
    iconSrc: "/assets/product/sensecloud/sec-5-verified-b-dark.svg",
    title: "Security & Reliability",
    description:
      "SensePC is built with security and control at the core - not as an afterthought.",
    items: [
      "Encrypted volumes for all SensePC",
      "Secure, session-based entry points",
      "Dedicated cloud desktops for every user",
      "Fine-grained access controls and audit-ready logs",
    ],
    dividerClassName: "border-white/10",
  },
  {
    iconSrc: "/assets/product/sensecloud/sec-5-sync-b-dark.svg",
    title: "Sense Cloud Integration",
    description: "Your desktops and your storage, managed together.",
    items: [
      "Unified billing for both compute and storage",
      "Storage tiers that adjust as your needs change",
      "Seamless access from inside your SensePC desktops",
    ],
    dividerClassName: "border-white/10",
  },
];

const SensePCPricingSection = () => (
  <ProductPricingLayout
    gridClassName="lg:items-stretch"
    leftColumnClassName="flex h-full flex-col gap-[23px]"
    rightColumnClassName="flex h-full flex-col gap-[30px]"
    leftTopContent={
      <div className="shrink-0 rounded-[16px] bg-[rgba(37,48,240,0.10)] p-[30px] dark:bg-[linear-gradient(163deg,_#170D44_11.73%,_rgba(23,13,68,0.61)_98.26%)]">
        <div className="space-y-3">
          <h2 className="font-['Space_Grotesk'] text-[28px] font-semibold leading-[40px] text-[#0B1220] dark:text-white md:text-[36px] md:leading-[56px] lg:text-[44px]">
            Flexible Plans That Match How You Work
          </h2>

          <p className="font-['Inter'] text-2xl font-normal leading-10 text-[#454545] dark:text-[#B9C2D5]">
            SensePC keeps billing simple. Add funds to your wallet, choose how
            each cloud PC is billed-hourly, daily, or monthly-and see precisely
            where your usage goes
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {planCards.map((plan) => (
            <div
              key={plan.tag}
              className="relative rounded-[8px] bg-transparent p-3 text-left before:absolute before:inset-0 before:rounded-[8px] before:p-px before:content-[''] before:[background:linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:pointer-events-none"
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
    }
    leftBottomContent={
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
    }
    rightContent={
      <>
        {infoCards.map((card) => (
          <ProductPricingInfoCard
            key={card.title}
            iconSrc={card.iconSrc}
            title={card.title}
            description={card.description}
            items={card.items}
            dividerClassName={card.dividerClassName}
          />
        ))}
      </>
    }
  />
);

export default SensePCPricingSection;
