




"use client";

import React from "react";

import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { useBuildPcNav } from "@/hooks/use-get-started";

import { StepCard } from "@/app/home/_components/step-card";

const steps = [
  {
    step: "STEP-1",
    icon: "/cloudserver",
    title: "Build Your SensePC",
    description:
      "Choose CPU, memory, storage, and OS. Set schedules and idle timeout so your SensePC fits your lifestyle and budget.",
  },
  {
    step: "STEP-2",
    icon: "/circular",
    title: "Connect in Seconds",
    description:
      "Launch directly from the browser with our remote desktop viewer. Your apps, files, and sessions stay in the cloud.",
  },
  {
    step: "STEP-3",
    icon: "/computer1",
    title: "Scale as You Grow",
    description:
      "Upgrade, pause, or create new SensePCs as your needs evolve. Perfect for individuals, teams, or entire organizations.",
  },
];

const RentSmarterProcess: React.FC = () => {
  const onBuildPc = useBuildPcNav();

  return (
    <section className="relative">
      {/* Light mode ellipses (positioned like Figma: upper-mid, clipped at edges) */}
      <div className="pointer-events-none absolute left-0 z-0 -translate-y-1/2 -translate-x-1/5">
        <img
          src="/assets/product/Ellipse 7-light.svg"
          alt=""
          className="block h-auto w-auto max-w-none select-none"
          style={{ marginTop: "clamp(6rem, 16vw, 9rem)" }} // upper-mid anchor
        />
      </div>

      <div className="pointer-events-none absolute right-0 z-0 -translate-y-1/2 translate-x-1/5">
        <img
          src="/assets/product/Ellipse 2-light.svg"
          alt=""
          className="block h-auto w-auto max-w-none select-none"
          style={{ marginTop: "clamp(6rem, 16vw, 9rem)" }} // upper-mid anchor
        />
      </div>

      {/* Existing right-side gradient glow */}
      <div className="pointer-events-none absolute top-1/2 -right-[200px] z-0 h-[50%] w-[267px] -translate-y-1/2 opacity-40 blur-[150px] bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)]" />

      <div className="container my-12 md:my-20 relative grid lg:grid-cols-5 gap-8 md:gap-24">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 space-y-12"
        >
          <h4 className="max-w-lg font-space-grotesk font-bold text-2xl md:text-4xl">
            How SensePC works
          </h4>
        </motion.div>

        {/* Right Content - Steps */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative lg:col-span-3"
        >
          {/* Mobile/Tablet Layout (md and below) */}
          <div className="block lg:hidden space-y-8 relative">
            {/* Vertical dotted line for mobile */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-0.5 opacity-60 pointer-events-none"
              style={{
                top: "2.5rem",
                bottom: "2.5rem",
                background:
                  "repeating-linear-gradient(to bottom, #8b5cf6 0px, #8b5cf6 6px, transparent 6px, transparent 12px)",
              }}
            />

            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <Button
                  variant={index === 0 ? "default" : "outline"}
                  className="flex-shrink-0 relative z-10 bg-white dark:bg-[#000624]"
                >
                  <span className="font-space-grotesk font-bold text-xl">
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

          {/* Desktop Layout (lg and above) */}
          <div className="hidden lg:block space-y-8 relative">
            <div
              className="absolute pointer-events-none"
              style={{
                left: "40px",
                top: "110px",
                bottom: "125px",
                width: "48px",
              }}
            >
              <div
                className="absolute left-1/2 transform -translate-x-1/2 w-20 h-full opacity-30 blur-xl"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(130, 155, 251, 0.5) 0%, rgba(130, 154, 251, 0.3) 50%, rgba(130, 154, 251, 0.1) 100%)",
                }}
              />

              <div
                className="absolute left-1/2 transform -translate-x-1/2 w-12 h-full opacity-40 blur-lg"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(130, 155, 251, 0.6) 0%, rgba(130, 154, 251, 0.4) 50%, rgba(130, 154, 251, 0.15) 100%)",
                }}
              />

              <div
                className="absolute left-1/2 w-0.5 h-full opacity-60 -translate-x-1/2"
                style={{
                  background:
                    "repeating-linear-gradient(to bottom, #8b5cf6 0px, #8b5cf6 8px, transparent 8px, transparent 16px)",
                }}
              />
            </div>

            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-8">
                <Button
                  variant={index === 0 ? "default" : "outline"}
                  className="relative z-10 bg-white dark:bg-[#000624]"
                >
                  <span className="font-space-grotesk font-bold text-xl">
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
};

export default RentSmarterProcess;
