import React from "react";
import Link from "next/link";
import ProductHero from "@/app/products/_components/product-hero";

import { Button } from "@/components/ui/button";

import { Check, ArrowUpRight } from "lucide-react";

import HeroRightCard from "./hero-right-card";

const HEADING_FONT =
  "justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8";

const Hero = () => (
  <ProductHero
    gridClassName="lg:grid-cols-[1.15fr,0.85fr]"
    leftContent={
      <>
        <div className="w-full space-y-3">
          {/* <p className="text-[14px] leading-5 tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5] md:text-[16px] md:leading-6">
            <span className="text-[#2530F0] dark:text-[#13E1EA]">SensePC</span>
            <span>{` · Cloud Desktop`}</span>
          </p> */}

          <h1
            className={`${HEADING_FONT} font-semibold tracking-[-1px] md:text-[48px] md:leading-[56px]`}
          >
            <span className="block text-[34px] leading-[42px] md:text-[48px] md:leading-[56px]">
              {/* <span className="bg-gradient-to-l from-[#BA25F0] from-[4.798%] via-[#2530F0] via-[46.154%] to-[#8086F3] bg-clip-text text-transparent">
                SensePC -
              </span> */}
              <span>A Cloud PC Built for Real-World Productivity</span>
            </span>
          </h1>

          <p className="max-w-2xl font-inter text-[24px] font-normal leading-[40px] tracking-[-0.4px] text-[#454545] dark:text-[#B9C2D5]">
            Launch a high-performing cloud workstation in just a few clicks.
            SensePC handles speed and security in the background so you can
            confidently work from any device.
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild>
            <Link
              href="/build-sensepc"
              className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <span>Start Building Your SensePC</span>
              <ArrowUpRight />
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <span>Talk to Our Team</span>
              <ArrowUpRight />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {[
            "No long-term contracts",
            "Pay only for what you use",
            "Secure, cloud-first by design",
          ].map((t) => (
            <div key={t} className="inline-flex items-center gap-2">
              <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#2530F0] dark:bg-[#13E1EA]">
                <Check className="h-3.5 w-3.5 text-white dark:text-black" />
              </span>

              <span className="text-[14px] leading-5 tracking-[-0.2px] text-[#020816] dark:text-white">
                {t}
              </span>
            </div>
          ))}
        </div>
      </>
    }
    rightContent={<HeroRightCard />}
  />
);

export default Hero;
