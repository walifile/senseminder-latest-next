"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type CtaButton = {
  label: string;
  onClick: () => void;
};

type GetStartedCtaSectionProps = {
  title: string;
  description: string;

  primaryCta: CtaButton;
  secondaryCta?: CtaButton;

  className?: string;
  ariaLabel?: string;
};

export function GetStartedCtaSection({
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
  ariaLabel = "Get started background",
}: GetStartedCtaSectionProps) {
  return (
    <section className={cn("relative", className)}>
      <div className="relative container my-12 md:my-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative z-[1] overflow-hidden rounded-2xl bg-[#F4F1FF] px-4 py-12 dark:bg-transparent dark:bg-[linear-gradient(276.71deg,rgba(128,134,243,0.5)_-194.99%,rgba(3,10,135,0.25)_-40.44%,rgba(186,37,240,0.5)_248.78%)] md:px-12 md:py-20"
          role="img"
          aria-label={ariaLabel}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto w-fit space-y-4 text-center md:space-y-8"
          >
            <div className="mx-auto flex max-w-[48.50rem] flex-col gap-[30px]">
              <div className="space-y-3">
                <h3 className="self-stretch text-center font-['Space_Grotesk'] text-3xl font-semibold leading-10 text-black dark:text-white md:text-5xl md:leading-[56px]">
                  {title}
                </h3>

                <p className="self-stretch text-center font-['Inter'] text-base font-normal leading-6 text-[#454545] dark:text-paragraph md:text-2xl md:leading-10">
                  {description}
                </p>
              </div>

              <div className="flex flex-col justify-center gap-4 md:flex-row">
                <Button
                  size="lg"
                  className="w-full md:w-fit"
                  onClick={primaryCta.onClick}
                >
                  {primaryCta.label}
                </Button>

                {secondaryCta ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full md:w-fit"
                    onClick={secondaryCta.onClick}
                  >
                    {secondaryCta.label}
                    <ArrowUpRight />
                  </Button>
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* Top decoration */}
          <div className="pointer-events-none">
            <Image
              src="/assets/svg/home2/get-started-cta-top.svg"
              alt=""
              width={320}
              height={320}
              className="absolute left-0 top-0 -z-[1] h-[93px] w-[140px] md:-top-5 md:size-80"
              priority
            />
          </div>

          {/* Bottom decoration */}
          <div className="pointer-events-none">
            <Image
              src="/assets/svg/home2/get-started-cta-bottom.svg"
              alt=""
              width={320}
              height={320}
              className="absolute right-0 -bottom-0 -z-[1] h-[93px] w-[140px] md:-bottom-8 md:size-80"
              priority
            />
          </div>

          {/* Inner glow */}
          <div className="pointer-events-none">
            <div className="absolute bottom-[-378px] left-[135px] h-96 w-[620.02px] origin-top-left rotate-[-11.32deg] rounded-[50%] bg-gradient-to-l from-fuchsia-600 via-blue-700 to-indigo-400 opacity-40 blur-[150px] -z-[1] dark:opacity-100" />
          </div>
        </motion.div>
      </div>

      {/* Outer glows */}
      <div className="pointer-events-none">
        <div className="absolute -left-[8%] top-1/2 h-[340px] w-[340px] -translate-y-1/2 rotate-[-11.32deg] rounded-full bg-gradient-to-l from-fuchsia-700 to-blue-700 opacity-30 blur-[250px] -z-[1] dark:opacity-50 md:-left-[15.5%] md:h-[681px] md:w-[681px]" />
      </div>
      <div className="pointer-events-none">
        <div className="absolute -right-[8%] top-1/2 h-[340px] w-[340px] -translate-y-1/2 rotate-[-11.32deg] rounded-full bg-gradient-to-l from-fuchsia-700 to-blue-700 opacity-30 blur-[250px] -z-[1] dark:opacity-50 md:-right-[15.5%] md:h-[681px] md:w-[681px]" />
      </div>

      {/* Right small blur */}
      <div className="absolute right-0 top-1/2 z-0 size-24 -translate-y-1/2 bg-[#E7ECEF] blur-[100px] md:blur-[150px]" />
    </section>
  );
}
