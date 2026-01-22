"use client";

import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

import FeatureCards from "./feature-cards";
import ProductFeatureCard from "./product-feature-card";

export type RealWorldUseItem = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
};

type RealWorldUseEllipses = {
  left?: { lightSrc: string; darkSrc: string; className?: string };
  right?: { lightSrc: string; darkSrc: string; className?: string };
};

type RealWorldUseProps = {
  heading: string;
  items: RealWorldUseItem[];

  /** Optional ellipses. If omitted, defaults match your current code. */
  ellipses?: RealWorldUseEllipses;

  /** Styling overrides */
  sectionClassName?: string;
  featureCardClassName?: string;
  gridClassName?: string;
  itemCardClassName?: string;
};

const DEFAULT_ELLIPSES: RealWorldUseEllipses = {
  left: {
    lightSrc: "/assets/product/Ellipse 9-light.svg",
    darkSrc: "/assets/product/Ellipse 9.svg",
    className: "pointer-events-none absolute left-0 top-[-70%] z-0",
  },
  right: {
    lightSrc: "/assets/product/Ellipse 8-light.svg",
    darkSrc: "/assets/product/Ellipse 8.svg",
    className: "pointer-events-none absolute right-0 top-[-70%] z-0",
  },
};

const RealWorldUse = ({
  heading,
  items,
  ellipses = DEFAULT_ELLIPSES,
  sectionClassName,
  featureCardClassName,
  gridClassName,
  itemCardClassName,
}: RealWorldUseProps) => {
  const left = ellipses?.left;
  const right = ellipses?.right;

  return (
    <section className={cn("relative py-16 md:py-20", sectionClassName)}>
      {/* Left ellipse */}
      {left?.lightSrc && left?.darkSrc ? (
        <div className={cn(DEFAULT_ELLIPSES.left?.className, left.className)}>
          <img
            src={left.lightSrc}
            alt=""
            className="block h-auto w-auto max-w-none select-none dark:hidden"
          />
          <img
            src={left.darkSrc}
            alt=""
            className="hidden h-auto w-auto max-w-none select-none dark:block"
          />
        </div>
      ) : null}

      {/* Right ellipse */}
      {right?.lightSrc && right?.darkSrc ? (
        <div className={cn(DEFAULT_ELLIPSES.right?.className, right.className)}>
          <img
            src={right.lightSrc}
            alt=""
            className="block h-auto w-auto max-w-none select-none dark:hidden"
          />
          <img
            src={right.darkSrc}
            alt=""
            className="hidden h-auto w-auto max-w-none select-none dark:block"
          />
        </div>
      ) : null}

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <FeatureCards
          className={cn("px-6 py-10 md:px-[50px] md:py-[70px]", featureCardClassName)}
        >
          <div className="flex flex-col items-center gap-8 md:gap-[50px]">
            <h2 className="w-full text-center font-[var(--font-space-grotesk)] text-[28px] font-semibold leading-[36px] tracking-[-1px] text-[#020816] dark:text-white md:text-[48px] md:leading-[56px]">
              {heading}
            </h2>

            <div className={cn("grid w-full gap-6 md:grid-cols-2 md:gap-[30px]", gridClassName)}>
              {items.map((item) => (
                <ProductFeatureCard
                  key={item.title}
                  className={cn("w-full p-6 md:p-[30px]", itemCardClassName)}
                >
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
                    <div className="relative h-[92px] w-[120px] shrink-0 md:h-[160px] md:w-[165px]">
                      <Image
                        src={item.imageSrc}
                        alt={item.imageAlt ?? item.title}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="font-[var(--font-space-grotesk)] text-[18px] font-semibold leading-[26px] tracking-[-0.4px] text-[#020816] dark:text-white md:text-[24px] md:leading-[32px]">
                        {item.title}
                      </h3>

                      <p className="text-[16px] leading-[24px] tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5] md:text-[18px] md:leading-[32px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </ProductFeatureCard>
              ))}
            </div>
          </div>
        </FeatureCards>
      </div>
    </section>
  );
};

export default RealWorldUse;
