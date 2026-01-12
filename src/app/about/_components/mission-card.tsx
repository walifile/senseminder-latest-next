"use client";

import React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { useGetStartedNav } from "@/hooks/use-get-started";

import { GradientInfoCard } from "../../home/_components/gradient-info-card";

export function MissionCard() {
  const onGetStarted = useGetStartedNav();

  return (
    <section className="relative isolate overflow-visible">
      <div className="container relative mb-16 md:mb-32 overflow-visible">
        {/* ✅ Decorative ellipse behind the Mission/Vision cards (dark mode only) */}
        <img
          src="/assets/svg/about/Ellipse 5-big.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none hidden md:hidden dark:md:block absolute left-1/2 top-0 z-0 -translate-x-1/2 -translate-y-[55%]"
        />

        <div className="grid gap-10 md:grid-cols-2 items-stretch relative z-10">
          {/* Our Mission */}
          <GradientInfoCard
            title="Our Mission"
            icon={
              <Image
                src="/assets/svg/about/our-mission.svg"
                alt="Our Mission"
                width={50}
                height={50}
                className="size-full"
              />
            }
          >
            <p className="w-full font-inter text-[18px] font-normal leading-[32px] tracking-[-0.3px] text-[#7D7D7D] dark:text-[#B9C2D5]">
              We’re on a mission to remove the friction separating you from
              high-performing computing and secure cloud storage. We believe
              that powerful computing shouldn’t require powerful hardware.
            </p>

            <p className="w-full font-inter text-[18px] font-normal leading-[32px] tracking-[-0.3px] text-[#7D7D7D] dark:text-[#B9C2D5]">
              To make our mission a reality, we have built our platform on real
              usage,
            </p>

            <p className="w-full font-inter text-[16px] font-semibold leading-[24px] tracking-[-0.3px] text-[#020816] dark:text-white">
              <span>So </span>

              {/* Light: solid blue text | Dark: gradient text */}
              <span className="text-[#2530F0] dark:bg-gradient-to-r dark:from-[#4C55F8] dark:via-[#8086F3] dark:to-[#D971FF] dark:bg-clip-text dark:text-transparent">
                You only pay for what you use.
              </span>
            </p>
          </GradientInfoCard>

          {/* Our Vision */}
          <GradientInfoCard
            title="Our Vision"
            icon={
              <Image
                src="/assets/svg/about/our-vision.svg"
                alt="Our Vision"
                width={50}
                height={50}
                className="size-full"
              />
            }
          >
            <p className="w-full font-inter text-[18px] font-normal leading-[32px] tracking-[-0.3px] text-[#7D7D7D] dark:text-[#B9C2D5]">
              Our vision is to create a computer that launches in seconds,
              wherever you are.
            </p>

            <p className="w-full font-inter text-[18px] font-normal leading-[32px] tracking-[-0.3px] text-[#7D7D7D] dark:text-[#B9C2D5]">
              No more hardware maintenance, storage issues, or manual upgrades.
              Your data stays protected with built-in security and a cloud-first
              design.
            </p>

            <p className="w-full font-inter text-[18px] font-normal leading-[32px] tracking-[-0.3px] text-[#7D7D7D] dark:text-[#B9C2D5]">
              And finally, we want to create compute power that scales
              automatically with your workload.
            </p>
          </GradientInfoCard>

          {/* Our Story */}
          <div className="md:col-span-2 relative isolate overflow-visible">
            {/* ✅ Huge ellipse behind the Our Story section (dark mode only) */}
            <img
              src="/assets/svg/about/Ellipse 4-huge.svg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none hidden md:hidden dark:md:block absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
            />

            <div className="relative z-10">
              <GradientInfoCard
                title="Our Story"
                rightImage="/assets/svg/about/our-story-1.svg"
              >
                <div className="font-inter text-[24px] font-normal leading-[40px] tracking-[-0.4px] text-[#7D7D7D] dark:text-[#B9C2D5]">
                  <p className="mb-4">
                    In 2020, our founder, Ashfak Ahmed, decided he wanted to
                    solve one of the cloud computing industry’s most bothersome
                    problems: the fact that powerful work is limited by local
                    hardware.
                  </p>

                  <p className="mb-4">
                    To fix that problem, Ash built Sense PC.
                  </p>

                  <p>
                    With his team, he built a cloud-native platform that
                    delivers performance, flexibility, and freedom that a
                    physical computer can’t match.
                  </p>
                </div>

                <div className="relative md:w-fit pt-12">
                  <Button
                    size="default"
                    className="relative w-full !py-4 h-auto"
                    onClick={onGetStarted}
                  >
                    Learn More
                    <ArrowUpRight />
                  </Button>
                </div>
              </GradientInfoCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
