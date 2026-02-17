import React from "react";
import Link from "next/link";
import Image from "next/image";
import { routes } from "@/constants/routes";

import { Button } from "@/components/ui/button";

import GetStartedCTAButton from "./get-started-cta-button";

const ProductHighlights = () => (
  <div
    data-testid="home-product-highlights"
    className="container relative my-12 md:my-20"
  >
    <h2 className="sr-only">Product Highlights</h2>
    <div className="relative z-10 max-md:flex max-md:flex-col md:grid md:grid-cols-2 md:grid-rows-3 gap-6 md:gap-8">
        <div
          className="relative rounded-2xl p-4 max-md:order-1 md:p-12 md:row-span-2 space-y-6 md:space-y-10 overflow-hidden bg-[#F5FAFE] dark:bg-transparent dark:bg-[radial-gradient(70.39%_50.81%_at_35.28%_-15.16%,_rgba(215,94,255,0.25)_0%,_rgba(9,2,51,0.5)_100%)]"
        >
          <div className="space-y-6 md:space-y-9">
            <div className="space-y-2">
              <h3 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                Performance without the Hardware
              </h3>
              <p className="text-paragraph text-base md:text-lg">
                Run demanding applications on a fast, reliable cloud desktop
                accessible from any device.
              </p>
            </div>

            <div className="max-md:grid grid-cols-2 md:flex gap-3 flex-wrap">
              <GetStartedCTAButton size="sm" label="Get Started" showIcon={false} />
              <Button size="sm" variant="outline" asChild>
                <Link href={routes.about}>Learn More</Link>
              </Button>
            </div>
          </div>

          <Image
            src="/assets/svg/cloud-pc.svg"
            alt="Way We Compute"
            width={600}
            height={400}
            className="w-full md:w-9/12 md:mx-auto relative z-10"
          />

          <div className="dark:hidden z-0 absolute -top-[400px] -left-[400px] size-1/2 w-[1069.99px] h-[472.71px] opacity-20 -rotate-[11.32deg] blur-[100px] bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]" />

          <div className="dark:hidden z-0 absolute -right-64 md:-right-40 -bottom-64 md:-bottom-40 size-1/2 w-[568.05px] h-[321.13px] opacity-25 blur-[100px] bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] -rotate-[11.32deg]" />

          <div className="hidden dark:block z-0 absolute max-md:-right-80 max-md:-bottom-80 md:right-0 md:bottom-0 size-1/2 bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] blur-[130px]" />
        </div>

        <div
          className="relative rounded-2xl p-4 max-md:order-2 md:p-12 space-y-6 md:space-y-12 overflow-hidden bg-[#F5FAFE] dark:bg-transparent dark:bg-[linear-gradient(276.71deg,_rgba(128,134,243,0.5)_-194.99%,_rgba(3,10,135,0.25)_-40.44%,_rgba(186,37,240,0.5)_248.78%)]"
        >
          <div className="flex max-md:flex-col gap-4">
            <Image
              src="/assets/svg/teamwork.svg"
              alt="Logo"
              width={75}
              height={75}
              unoptimized
            />
            <div className="space-y-2">
              <h3 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                Work Together from Anywhere
              </h3>
              <p className="text-paragraph text-base md:text-lg">
                Share the same secure cloud environment and collaborate in real
                time. No complex setup.
              </p>
            </div>
          </div>

          <div className="max-md:grid grid-cols-2 md:flex gap-3 flex-wrap">
            <GetStartedCTAButton size="sm" label="Get Started" showIcon={false} />
            <Button size="sm" variant="outline" asChild>
              <Link href={routes.about}>Learn More</Link>
            </Button>
          </div>

          <div className="dark:hidden z-0 absolute -rotate-[11.32deg] -top-[380px] -left-[380px] blur-[100px] w-[1069.99px] h-[472.71px] opacity-20 bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]" />

          <div className="dark:hidden z-0 absolute -rotate-[11.32deg] -right-64 -bottom-64 blur-[100px] w-[568.05px] h-[321.13px] opacity-25 bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]" />
        </div>

        <div
          className="relative rounded-2xl p-4 max-md:order-4 md:p-12 md:row-span-2 space-y-6 md:space-y-10 overflow-hidden bg-[#F5FAFE] dark:bg-transparent dark:bg-[radial-gradient(70.39%_50.81%_at_35.28%_-15.16%,_rgba(215,94,255,0.25)_0%,_rgba(9,2,51,0.5)_100%)]"
        >
          <div className="space-y-6 md:space-y-9">
            <div className="space-y-2">
              <h3 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                Only Pay for the Power You Use
              </h3>
              <p className="text-paragraph text-base md:text-lg">
                Scale your computing needs and keep costs low with flexible,
                usage-based billing.
              </p>
            </div>

            <div className="max-md:grid grid-cols-2 md:flex gap-3 flex-wrap">
              <GetStartedCTAButton size="sm" label="Get Started" showIcon={false} />
              <Button size="sm" variant="outline" asChild>
                <Link href={routes.about}>Learn More</Link>
              </Button>
            </div>
          </div>

          <Image
            src="/assets/svg/cost-effective-solutions.svg"
            alt="Way We Compute"
            width={600}
            height={400}
            className="w-full md:w-9/12 md:mx-auto relative z-10"
          />

          <div className="dark:hidden z-0 absolute -top-[400px] -left-[400px] size-1/2 w-[1069.99px] h-[472.71px] opacity-20 -rotate-[11.32deg] blur-[100px] bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]" />

          <div className="dark:hidden z-0 absolute -right-64 md:-right-40 -bottom-64 md:-bottom-40 size-1/2 w-[568.05px] h-[321.13px] opacity-25 blur-[100px] bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] -rotate-[11.32deg]" />

          <div className="hidden dark:block z-0 absolute max-md:-right-80 max-md:-bottom-80 md:right-0 md:bottom-0 size-1/2 bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)] blur-[130px]" />
        </div>

        <div
          className="relative rounded-2xl p-4 max-md:order-3 md:p-12 space-y-6 md:space-y-12 overflow-hidden bg-[#F5FAFE] dark:bg-transparent dark:bg-[linear-gradient(276.71deg,_rgba(128,134,243,0.5)_-194.99%,_rgba(3,10,135,0.25)_-40.44%,_rgba(186,37,240,0.5)_248.78%)]"
        >
          <div className="flex max-md:flex-col gap-4">
            <Image
              src="/assets/svg/database.svg"
              alt="Logo"
              width={75}
              height={75}
              unoptimized
            />
            <div className="space-y-2">
              <h3 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                Your Data, Protected By Design
              </h3>
              <p className="text-paragraph text-base md:text-lg">
                Encryption and built-in safeguards keep your files secure
                wherever you work.
              </p>
            </div>
          </div>

          <div className="max-md:grid grid-cols-2 md:flex gap-3 flex-wrap">
            <GetStartedCTAButton size="sm" label="Get Started" showIcon={false} />
            <Button size="sm" variant="outline" asChild>
              <Link href={routes.about}>Learn More</Link>
            </Button>
          </div>

          <div className="dark:hidden z-0 absolute -rotate-[11.32deg] -top-[380px] -left-[380px] blur-[100px] w-[1069.99px] h-[472.71px] opacity-20 bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]" />

          <div className="dark:hidden z-0 absolute -rotate-[11.32deg] -right-64 -bottom-64 blur-[100px] w-[568.05px] h-[321.13px] opacity-25 bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]" />
        </div>
    </div>

    <div className="z-0 absolute -bottom-20 left-1/2 -translate-x-1/2 w-[680px] h-[680px] -rotate-[11.32deg] opacity-50 blur-[500px] dark:blur-[120px] bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)]" />
  </div>
);

export default ProductHighlights;
