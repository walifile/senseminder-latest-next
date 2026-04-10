import React from "react";
import Image from "next/image";

import ProductPricingLayout from "./product-pricing-layout";
import ProductPricingInfoCard from "./product-pricing-info-card";

const HEADING_FONT =
  "justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8";

const planCards = [
  {
    tag: "AUTO-TIERED",
    title: "Adaptive billing",
    description:
      "Your monthly charge reflects the highest storage usage during the billing period. ",
    icon: "/assets/product/sensecloud/sec-5-sync-dark.svg",
  },
  {
    tag: "DEDICATED PLANS",
    title: "Reserved capacity",
    description:
      "Lock in storage you need with consistent pricing for stable, long-running workloads. ",
    icon: "/assets/product/sensecloud/sec-5-verified-dark.svg",
  },
  {
    tag: "UNIFIED BILLING",
    title: "One wallet for everything",
    description:
      "Storage and compute charges flow into a single SensepC wallet and invoice history.",
    icon: "/assets/product/sensecloud/sec-5-billing-dark.svg",
  },
];

const infoCards = [
  {
    iconSrc: "/assets/product/sensecloud/sec-5-Union-b-dark.svg",
    title: "Storage Billing Highlights",
    items: [
      "Auto-tiered pricing",
      "Dedicated capacity plans",
      "Unified billing across storage",
      "Clear usage history",
    ],
  },
  {
    iconSrc: "/assets/product/sensecloud/sec-5-verified-b-dark.svg",
    title: "Durability & Availability",
    description: "Sense Cloud is built to keep your files safe and easy to access.",
    items: [
      "Durability-Your files won't get lost. Sense Cloud keeps extra copies, so nothing disappears.",
      "Availability: your files are ready even if one system has a problem.",
      "Sense Cloud automatically checks your data to ensure nothing is damaged.",
    ],
  },
  {
    iconSrc: "/assets/product/sensecloud/sec-5-sync-b-dark.svg",
    title: "SensePC Integration",
    description: "Sense Cloud works naturally with your cloud desktops.",
    items: [
      "Your files show up inside your Sense PC just like they're a part of your desktop.",
      "You can attach storage easily and see how much space you're using.",
      "It's designed to support more helpful features in the future, like snapshots.",
      "You can manage both your cloud desktops and storage from a single dashboard.",
    ],
  },
];

const SenseCloudPricingSection = () => (
  <ProductPricingLayout
    leftTopContent={
      <div className="rounded-[16px] bg-[rgba(37,48,240,0.10)] p-[30px] dark:bg-[linear-gradient(163deg,_#170D44_11.73%,_rgba(23,13,68,0.61)_98.26%)]">
        <div className="space-y-3">
          <h2 className={`${HEADING_FONT} leading-[40px] md:text-[36px] md:leading-[56px] lg:text-[44px]`}>
            Sense Cloud Pricing & Plans
          </h2>

          <p className="text-2xl font-normal font-['Inter'] leading-10 text-[#454545] dark:text-[#B9C2D5]">
            Sense Cloud uses the same simple, transparent, and wallet-based
            billing system as Sense PC. Auto-tiered plans adjust to your usage,
            while dedicated plans give you predictable pricing and reserved
            capacity when you need it.
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

              <h3 className={`${HEADING_FONT} text-base font-semibold leading-8`}>
                {plan.title}
              </h3>

              <p className="text-sm font-normal font-['Inter'] leading-5 text-[#454545] dark:text-[#B9C2D5]">
                {plan.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    }
    leftBottomContent={
      <div className="flex items-center justify-center rounded-[16px] bg-[rgba(37,48,240,0.10)] p-6 dark:bg-[rgba(255,255,255,0.07)]">
        <Image
          src="/assets/svg/product/pricing.svg"
          alt="SenseCloud storage illustration"
          width={420}
          height={320}
          className="h-auto w-full max-w-[420px]"
          priority={false}
        />
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
            titleClassName={`${HEADING_FONT} text-2xl font-semibold`}
          />
        ))}
      </>
    }
  />
);

export default SenseCloudPricingSection;
