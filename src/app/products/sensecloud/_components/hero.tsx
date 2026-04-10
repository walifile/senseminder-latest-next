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
    leftColumnClassName="font-['Inter']"
    leftContent={
      <>
        <div className="w-full space-y-3">
          {/* <p className="text-[14px] leading-5 tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5] md:text-[16px] md:leading-6">
            <span className="text-[#2530F0] dark:text-[#13E1EA]">Sense Cloud</span>
            <span>{` · Cloud Storage`}</span>
          </p> */}

          <h1 className="font-['Space_Grotesk'] font-semibold tracking-[-1px] text-[#020816] dark:text-white">
            <span className="block text-[34px] leading-[42px] md:text-[48px] md:leading-[56px]">
              {/* <span className="bg-gradient-to-l from-[#BA25F0] from-[4.798%] via-[#2530F0] via-[46.154%] to-[#8086F3] bg-clip-text text-transparent">
                SenseCloud -
              </span> */}
              <span>{` Storage That Lives With Your Cloud PCs.`}</span>
            </span>
          </h1>

          <p className="max-w-2xl text-[16px] leading-7 tracking-[-0.4px] text-[#454545] dark:text-[#B9C2D5] md:text-[24px] md:leading-[40px]">
            Secure, Scalable, cost-aware storage built for Sense PC. Your
            business cloud storage is ready in minutes. Connect from any device
            and stay productive while Sense PC handles everything for you.
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild>
            <Link
              href="/build-sensepc"
              className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <span>Start Building Your Sense PC </span>
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
            "Protected Cloud Storage ",
            "Elasticity",
            "Auto-Tiering",
            "No long-term contracts",
            "Pay only for what you use",
          ].map((t) => (
            <div key={t} className="inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-[6px]">
                <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#2530F0] dark:bg-[#13E1EA]">
                  <Check className="h-3.5 w-3.5 text-white dark:text-black" />
                </span>
              </span>

              <span className={HEADING_FONT + " text-[14px] leading-5 font-semibold"}>
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
