"use client";

import React from "react";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { StepCard } from "./step-card";

const steps = [
  {
    step: "STEP-1",
    icon: "/settings1", // You'll need to add this icon
    title: "Choose Your Configuration",
    description: "Select your ideal resources (CPU, RAM, Storage).",
  },
  {
    step: "STEP-2",
    icon: "/rocket", // You'll need to add this icon
    title: "Launch Your Sense PC",
    description:
      "Access your virtual computer instantly via browser or smart monitor.",
  },
  {
    step: "STEP-3",
    icon: "/computer1", // You'll need to add this icon
    title: "Work, Play, and Create",
    description:
      "Enjoy seamless performance and flexibility anytime, anywhere.",
  },
];

const RentSmarterProcess: React.FC = () => (
  <section className="relative">
    <div className="z-0 absolute -top-80 -left-96 blur-[160px] md:blur-[200px] w-60 md:w-[400px] h-full opacity-40 bg-[#9C05BF]" />
    <div className="z-0 absolute top-0 -left-72 blur-[160px] md:blur-[200px] w-60 md:w-[400px] h-full opacity-40 bg-[#4027E5]" />

    <div className="z-0 absolute w-[267px] h-[50%] opacity-40 top-1/2 -translate-y-1/2 -right-[200px] bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)] blur-[150px]" />

    <div className="container my-12 md:my-20 relative grid lg:grid-cols-5 gap-8 md:gap-24">
      {/* Left Content */}
      <div className="lg:col-span-2 space-y-12">
        <h4 className="max-w-lg font-space-grotesk font-bold text-2xl md:text-5xl">
          Why Buy <br /> Expensive Hardware When You Can Rent Smarter?
        </h4>

        <Button size="lg" className="w-full lg:w-fit">
          Build Your Sense PC Now!
          <ArrowUpRight />
        </Button>
      </div>

      {/* Right Content - Steps */}
      <div className="relative lg:col-span-3">
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
              {/* Button */}
              <Button
                variant={index === 0 ? "default" : "outline"}
                className="flex-shrink-0 relative z-10 bg-white dark:bg-[#000624]"
              >
                <span className="font-space-grotesk font-bold text-xl">
                  STEP-{index + 1}
                </span>
              </Button>

              {/* Spacer for gap between button and card */}
              <div className="h-8" />

              {/* Card */}
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
            {/* Soft radial glow effect around the dotted line */}
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
              {/* Button */}
              <Button
                variant={index === 0 ? "default" : "outline"}
                className="relative z-10 bg-white dark:bg-[#000624]"
              >
                <span className="font-space-grotesk font-bold text-xl">
                  STEP-{index + 1}
                </span>
              </Button>

              {/* Card */}
              <StepCard
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default RentSmarterProcess;
