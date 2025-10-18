"use client";

import "../../../styles/animations.css";

import React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

const Hero = () => (
  <section>
    <div className="bg-[linear-gradient(180deg,_#F4F1FF_0%,_#FFFFFF_100%)] dark:bg-none mt-[60px] md:mt-[92px]">
      <div className="container flex flex-col-reverse md:grid md:grid-cols-2 gap-4 md:items-center py-10 md:py-32">
        <div className="flex flex-col gap-6 md:gap-12">
          <div className="flex flex-col gap-2.5 md:gap-3">
            <p className="font-space-grotesk font-bold text-3xl md:text-7xl leading-none tracking-tight">
              <span className="text-transparent bg-clip-text bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]">
                The Future of
              </span>{" "}
              Computing is Here
            </p>
            <p className="text-paragraph text-base">
              Build, manage, and optimize your computer in minutes
            </p>
          </div>

          <div className="relative md:w-fit">
            <div className="z-0 absolute left-1/2 top-2.5 -translate-x-1/2 w-[50%] h-[40px] blur-[35px] bg-[linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)]" />

            <Button size="lg" className="relative w-full z-10">
              Get Started Now
              <ArrowUpRight />
            </Button>
          </div>
        </div>

        <Image
          src="/assets/svg/hero.svg"
          alt="Hero"
          width={600}
          height={400}
          className="size-full"
          priority
        />
      </div>
    </div>
  </section>
);

export default Hero;
