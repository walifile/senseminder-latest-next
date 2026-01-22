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
    title: "Native to Sense PC",
    description:
      "Your files live in the same environment as your cloud desktops. They are fast, secure, and always in sync.",
    iconSrc: "/assets/product/sensecloud/cloud-data.svg",
    iconAlt: "Flash",
  },
  {
    title: "Built for Organization",
    description:
      "Keep everything structured with tagging, metadata, and clean workspace-level organization.",
    iconSrc: "/assets/product/sensecloud/data-searching.svg",
    iconAlt: "Union",
  },
  {
    title: "Scales Instantly",
    description:
      "Grow from gigabytes to terabytes without lifting a finger. No migrations. No downtime.",
    iconSrc: "/assets/product/sensecloud/full-screen.svg",
    iconAlt: "Card Union",
  },
  {
    title: "Safe by Default",
    description:
      "Versioning and recovery tools make it easy to reverse mistakes and protect your data. ",
    iconSrc: "/assets/product/sensecloud/data-recovery.svg",
    iconAlt: "Cyber Security",
  },
];

const WhyTeamsChoose = () => (
  <section className="relative py-16 md:py-20">
    {/* Background glows */}
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
        <h2 className="w-full text-center font-['Space_Grotesk'] text-[36px] font-semibold leading-[44px] tracking-[-1px] capitalize text-[#020816] dark:text-white md:text-[48px] md:leading-[56px]">
          Why Sense Cloud for Storage
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
                  <h3 className="font-['Space_Grotesk'] text-[18px] font-semibold leading-8 text-[#020816] dark:text-white">
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

export default WhyTeamsChoose;
