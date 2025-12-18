



"use client";

import React from "react";
import Image from "next/image";

import ProductFeatureCard from "./product-feature-card";

type Feature = {
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
};

const FEATURES: Feature[] = [
  {
    title: "Cloud PCs in Minutes",
    description:
      "Spin up a high-performance Windows or Linux desktop in just a few clicks. No hardware to buy, no drivers to manage.",
    iconSrc: "/assets/product/flash.svg",
    iconAlt: "Flash",
  },
  {
    title: "Access from Any Device",
    description:
      "Use your laptop, tablet, or even a basic machine to connect to your SensePC — your real work happens in the cloud.",
    iconSrc: "/assets/product/Union.svg",
    iconAlt: "Union",
  },
  {
    title: "Pay Only for What You Use",
    description:
      "Hourly, daily, and monthly plans with transparent billing and wallet-based payments designed for real-world usage.",
    iconSrc: "/assets/product/cardunion.svg",
    iconAlt: "Card Union",
  },
  {
    title: "Secure by Design",
    description:
      "Isolated cloud desktops, encrypted storage, strict access controls, and audit-friendly logs built in from day one.",
    iconSrc: "/assets/product/cyber.svg",
    iconAlt: "Cyber Security",
  },
];

const WhyTeamsChoose = () => {
  return (
    <section className="relative py-16 md:py-20">
      {/* Background glows */}
      {/* Left glow: Ellipse 7 */}
      {/* <div className="pointer-events-none absolute left-0 top-1/2 z-0 -translate-y-1/2">
        <img
          src="/assets/product/Ellipse 7.svg"
          alt=""
          className="block h-auto w-auto max-w-none select-none"
        />
      </div>

      <div className="pointer-events-none absolute right-0 top-1/2 z-0 -translate-y-1/2">
        <img
          src="/assets/product/Ellipse 2.svg"
          alt=""
          className="block h-auto w-auto max-w-none select-none"
        />
      </div> */}


      <div className="pointer-events-none absolute left-0 top-1/2 z-0 -translate-y-1/2 hidden dark:block">
  <img
    src="/assets/product/Ellipse 7.svg"
    alt=""
    className="block h-auto w-auto max-w-none select-none"
  />
</div>

<div className="pointer-events-none absolute right-0 top-1/2 z-0 -translate-y-1/2 hidden dark:block">
  <img
    src="/assets/product/Ellipse 2.svg"
    alt=""
    className="block h-auto w-auto max-w-none select-none"
  />
</div>


      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="w-full text-center font-[var(--font-space-grotesk)] text-[36px] font-semibold leading-[44px] tracking-[-1px] capitalize text-[#020816] dark:text-white md:text-[48px] md:leading-[56px]">
            Why teams choose SensePC
          </h2>

          <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <ProductFeatureCard key={feature.title} className="w-full">
                <div className="flex w-full flex-col gap-6">
                  <div className="relative h-[55px] w-[55px]">
                    <Image
                      src={feature.iconSrc}
                      alt={feature.iconAlt}
                      fill
                      className="object-contain"
                      priority={feature.title === "Cloud PCs in Minutes"}
                    />
                  </div>

                  <div className="flex flex-col gap-2 tracking-[-0.3px]">
                    <h3 className="font-[var(--font-space-grotesk)] text-[18px] font-semibold leading-8 text-[#020816] dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-[16px] leading-6 text-[#454545] dark:text-[#B9C2D5]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </ProductFeatureCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyTeamsChoose;
