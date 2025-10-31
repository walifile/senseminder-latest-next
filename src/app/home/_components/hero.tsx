"use client";

import "../../../styles/animations.css";

import React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";
import { useTheme } from "@/components/shared/layout/theme-provider";

const Hero = () => {
  
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  // Use dark-specific image when theme resolves to dark; otherwise light/default
  const heroSrc = mounted && resolvedTheme === "dark"
    ? "/assets/svg/hero-banner-light.svg"
    : "/assets/svg/hero-banner-light.svg"; // change to hero-banner-light.svg if you add it

  return (
    <section className="relative bg-[linear-gradient(180deg,_#F4F1FF_0%,_#FFFFFF_100%)] dark:bg-none ">
      {/* <div className="z-0 absolute inset-0 bg-[url('/assets/svg/hero-bg-lines.svg')] bg-contain bg-center" /> */}
      {/* Light beam overlay behind the illustration */}

      {/* <div className="z-0 md:-rotate-[168deg] absolute -top-10 md:-top-32 -left-20 blur-[60px] md:blur-[150px] size-32 md:size-60 bg-[#2530F0]" />
    <div className="z-0 md:-rotate-[11deg] absolute -top-10 md:-top-32 -right-20 blur-[60px] md:blur-[150px] size-32 md:size-60 bg-[#2530F0]" /> */}

      <div className="hidden md:block z-0 absolute bottom-20 left-0 blur-[100px] size-24 bg-[#A801BA]" />
      <div className="hidden md:block z-0 absolute top-20 left-1/2 -translate-x-1/2 blur-[140px] size-24 bg-white" />
      <div className="hidden md:block z-0 absolute bottom-20 right-0 blur-[250px] size-60 bg-[#E7ECEF]" />

      <div className="z-10 relative mt-[60px] md:mt-[92px]">
        {/* <div className="container flex flex-col-reverse md:grid md:grid-cols-2 gap-4 md:items-center py-10 md:py-32"> */}
        <div className="container flex flex-col-reverse md:grid md:grid-cols-2 gap-4 md:gap-[90px] md:px-0 md:items-center py-10 md:py-32">
          <div className="flex flex-col gap-6 md:gap-12">
            {/* <div className="flex flex-col gap-2.5 md:gap-3 w-[85%]"> */}
            <div className="flex flex-col gap-2.5 md:gap-3">
              <p className="font-space-grotesk font-bold text-3xl md:text-[82px] leading-[1] w-full md:w-[85%]">
                <span className="text-transparent bg-clip-text bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]">
                  The Future of
                </span>{" "}
                Computing is Here
              </p>
              <p className="text-paragraph text-base md:text-2xl w-full md:w-[85%]">
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

          <div className="relative">
            <Image
              src={heroSrc}
              alt="Hero"
              width={600}
              height={400}
              className="size-full"
              priority
            />
          </div>
        </div>
      </div>
      {/* <Image
      src="/assets/svg/light-beam.svg"
      alt=""
      fill
      priority={false}
      className="hidden md:block z-0 object-cover opacity-60 pointer-events-none select-none !top-[45%]"
    /> */}
    </section>
  );
}

export default Hero;
