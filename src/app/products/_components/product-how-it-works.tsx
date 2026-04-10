"use client";

import React from "react";
import { StepCard } from "@/app/home/_components/step-card";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";

export type ProductHowItWorksStep = {
  step?: string;
  icon: string;
  title: string;
  description: string;
};

type ProductHowItWorksProps = {
  title: string;
  steps: ProductHowItWorksStep[];
  titleClassName?: string;
  stepLabelClassName?: string;
  sectionClassName?: string;
  containerClassName?: string;
};

const ProductHowItWorks = ({
  title,
  steps,
  titleClassName,
  stepLabelClassName,
  sectionClassName,
  containerClassName,
}: ProductHowItWorksProps) => (
  <section className={cn("relative", sectionClassName)}>
    <div
      className={cn(
        "container relative my-12 grid gap-8 md:my-20 md:gap-24 lg:grid-cols-5",
        containerClassName
      )}
    >
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="space-y-12 lg:col-span-2"
      >
        <h4
          className={cn(
            "max-w-lg font-['Space_Grotesk'] text-2xl font-bold leading-8 text-black dark:text-white md:text-4xl",
            titleClassName
          )}
        >
          {title}
        </h4>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative lg:col-span-3"
      >
        <div className="relative block space-y-8 lg:hidden">
          <div
            className="pointer-events-none absolute left-1/2 w-0.5 -translate-x-1/2 opacity-60"
            style={{
              top: "2.5rem",
              bottom: "2.5rem",
              background:
                "repeating-linear-gradient(to bottom, #8b5cf6 0px, #8b5cf6 6px, transparent 6px, transparent 12px)",
            }}
          />

          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center">
              <Button
                variant={index === 0 ? "default" : "outline"}
                className="relative z-10 flex-shrink-0 bg-white dark:bg-[#000624]"
              >
                <span
                  className={cn(
                    "font-space-grotesk text-xl font-bold",
                    stepLabelClassName
                  )}
                >
                  STEP-{index + 1}
                </span>
              </Button>

              <div className="h-8" />

              <StepCard
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            </div>
          ))}
        </div>

        <div className="relative hidden space-y-8 lg:block">
          <div
            className="pointer-events-none absolute"
            style={{
              left: "40px",
              top: "110px",
              bottom: "125px",
              width: "48px",
            }}
          >
            <div
              className="absolute left-1/2 h-full w-20 -translate-x-1/2 blur-xl opacity-30"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(130, 155, 251, 0.5) 0%, rgba(130, 154, 251, 0.3) 50%, rgba(130, 154, 251, 0.1) 100%)",
              }}
            />

            <div
              className="absolute left-1/2 h-full w-12 -translate-x-1/2 blur-lg opacity-40"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(130, 155, 251, 0.6) 0%, rgba(130, 154, 251, 0.4) 50%, rgba(130, 154, 251, 0.15) 100%)",
              }}
            />

            <div
              className="absolute left-1/2 h-full w-0.5 -translate-x-1/2 opacity-60"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, #8b5cf6 0px, #8b5cf6 8px, transparent 8px, transparent 16px)",
              }}
            />
          </div>

          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center gap-8">
              <Button
                variant={index === 0 ? "default" : "outline"}
                className="relative z-10 bg-white dark:bg-[#000624]"
              >
                <span
                  className={cn(
                    "font-space-grotesk text-xl font-bold",
                    stepLabelClassName
                  )}
                >
                  STEP-{index + 1}
                </span>
              </Button>

              <StepCard
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default ProductHowItWorks;
