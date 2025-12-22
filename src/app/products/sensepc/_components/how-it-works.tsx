"use client";

import React from "react";
import { StepCard } from "@/app/home/_components/step-card";

import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";

const steps = [
  {
    step: "STEP-1",
    icon: "/cloudserver",
    title: "Set Up Your Cloud PC",
    description:
      "Customize the power you need to fit your project. CPU, memory, storage, and OS—the way you like. Automate uptime and idle behavior to control cost.",
  },
  {
    step: "STEP-2",
    icon: "/circular",
    title: "Get to Work in SECONDS",
    description:
      "Launch your cloud desktop from any browser. Your apps and files live in the cloud, ready when you need them.",
  },
  {
    step: "STEP-3",
    icon: "/computer1",
    title: "Adapt As Your Work Changes",
    description:
      "Increase resources, pause machines, or add new workstations anytime. SensePC grows with your workflow, not the other way around.",
  },
];

const RentSmarterProcess: React.FC = () => (
  <section className="relative">
    {/* Light mode ellipses (positioned like Figma: upper-mid, clipped at edges) */}
    <div className="pointer-events-none absolute left-0 z-0 -translate-y-1/2 -translate-x-1/5">
      <img
        src="/assets/product/Ellipse 7-light.svg"
        alt=""
        className="block h-auto w-auto max-w-none select-none"
        style={{ marginTop: "clamp(6rem, 16vw, 9rem)" }}
      />
    </div>

    <div className="pointer-events-none absolute right-0 z-0 -translate-y-1/2 translate-x-1/5">
      <img
        src="/assets/product/Ellipse 2-light.svg"
        alt=""
        className="block h-auto w-auto max-w-none select-none"
        style={{ marginTop: "clamp(6rem, 16vw, 9rem)" }}
      />
    </div>

    {/* Existing right-side gradient glow */}
    <div className="pointer-events-none absolute top-1/2 -right-[200px] z-0 h-[50%] w-[267px] -translate-y-1/2 opacity-40 blur-[150px] bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)]" />

    <div className="container relative my-12 grid gap-8 md:my-20 md:gap-24 lg:grid-cols-5">
      {/* Left Content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="space-y-12 lg:col-span-2"
      >
        <h4 className="max-w-lg font-space-grotesk text-2xl font-bold md:text-4xl">
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
        <div className="relative block space-y-8 lg:hidden">
          {/* Vertical dotted line for mobile */}
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
            <div key={index} className="flex flex-col items-center">
              <Button
                variant={index === 0 ? "default" : "outline"}
                className="relative z-10 flex-shrink-0 bg-white dark:bg-[#000624]"
              >
                <span className="font-space-grotesk text-xl font-bold">
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
            <div key={index} className="flex items-center gap-8">
              <Button
                variant={index === 0 ? "default" : "outline"}
                className="relative z-10 bg-white dark:bg-[#000624]"
              >
                <span className="font-space-grotesk text-xl font-bold">
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

export default RentSmarterProcess;
