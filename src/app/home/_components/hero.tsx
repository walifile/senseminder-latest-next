"use client";

import "../../../styles/animations.css";

import React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { useGetStartedNav } from "@/hooks/use-get-started";

type HeroProps = {
  children: React.ReactNode; // title + subtitle (can include gradient spans)
  textMinWidth?: React.CSSProperties["minWidth"];
  imageSrc: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
};

const Hero: React.FC<HeroProps> = ({
  children,
  textMinWidth = "auto",
  imageSrc,
  imageAlt = "Hero",
  imageWidth = 600,
  imageHeight = 400,
}) => {
  const onGetStarted = useGetStartedNav();

  return (
    <section className="relative bg-[linear-gradient(180deg,_#F4F1FF_0%,_#FFFFFF_100%)] dark:bg-none">
      <div className="hidden md:block z-0 absolute bottom-20 left-0 blur-[100px] size-24 bg-[#A801BA]" />
      <div className="hidden md:block z-0 absolute top-20 left-1/2 -translate-x-1/2 blur-[140px] size-24 bg-white" />
      <div className="hidden md:block z-0 absolute bottom-20 right-0 blur-[250px] size-60 bg-[#E7ECEF]" />

      <div className="container z-10 relative mt-[60px] md:mt-[92px]">
        <div className="container flex flex-col-reverse md:grid md:grid-cols-2 gap-4 md:gap-[90px] md:items-center px-0 py-10 md:pt-16 md:pb-32">
          {/* LEFT: TEXT (from parent) */}
          <div
            className={`flex flex-col gap-6 md:gap-12 w-full ${
              textMinWidth === "auto" ? "w-auto" : `w-[${textMinWidth}]`
            }`}
          >
            <div className="flex flex-col gap-2.5 md:gap-3">{children}</div>

            <div className="relative md:w-fit">
              <div className="z-0 absolute left-1/2 top-2.5 -translate-x-1/2 w-[50%] h-[40px] bg-[linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)]" />
              <Button
                size="lg"
                className="relative w-full z-10"
                onClick={onGetStarted}
              >
                Get Started Now
                <ArrowUpRight />
              </Button>
            </div>
          </div>

          {/* RIGHT: IMAGE (configurable per page) */}
          <div className="relative">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className="size-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
