"use client";

import React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

export default function GetStartedCTA() {
  return (
    <section className="container my-12 md:my-20">
      <div
        className="relative rounded-2xl px-4 py-28 md:px-12 md:py-32 overflow-hidden bg-[#F4F1FF] dark:bg-transparent dark:bg-[linear-gradient(276.71deg,rgba(128,134,243,0.5)_-194.99%,rgba(3,10,135,0.25)_-40.44%,rgba(186,37,240,0.5)_248.78%)]"
        role="img"
        aria-label="Get started background"
      >
        <div className="relative mx-auto w-fit text-center space-y-4 md:space-y-8">
          <h3 className="font-space-grotesk font-bold text-2xl md:text-5xl">
            Make the Smart Move -
            <br />
            Switch to Sense PC!
          </h3>

          <Button size="lg" className="w-full md:w-fit">
            Get Started Now
            <ArrowUpRight />
          </Button>
        </div>

        <Image
          src="/assets/svg/get-started-cta-top.svg"
          alt="FAQ Illustration"
          width={320}
          height={320}
          className="absolute w-[140px] h-[93px] md:size-80 top-0 md:-top-5 left-0"
          priority
        />

        <Image
          src="/assets/svg/get-started-cta-bottom.svg"
          alt="FAQ Illustration"
          width={320}
          height={320}
          className="absolute w-[140px] h-[93px] md:size-80 -bottom-0 md:-bottom-8 right-0"
          priority
        />

        <div className="z-0 absolute md:-rotate-[11.32deg] left-1/2 -translate-x-1/2 -bottom-20 md:-bottom-60 md:left-[20%] md:translate-x-0 blur-[40px] md:blur-[100px] size-1/2 md:w-[570px] md:h-[320px] opacity-20 bg-[linear-gradient(270deg,#BA25F0_4.8%,#2530F0_46.15%,#8086F3_100%)]" />
      </div>
    </section>
  );
}
