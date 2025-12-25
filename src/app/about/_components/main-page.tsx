
"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { MainLayout } from "./layout";
import { MissionCard } from "./mission-card";
import Hero from "../../home/_components/hero";
import { WhoWeServeSection } from "./who-we-serve-section";
import { Breadcrumb } from "../../home/_components/breadcrumb";
import GetStartedCTA from "../../home/_components/get-started-cta";

export default function AboutPage() {
  const pathname = usePathname();

  return (
    <MainLayout>
      <Hero
        // ✅ IMPORTANT: remove desktop min-width constraint for mobile
        textMinWidth={0}
        imageSrc="/assets/svg/about-hero-dark.svg"
        imageWidth={600}
        imageHeight={400}
        imageAlt="About illustration"
      >
        <div className="w-full min-w-0 md:min-w-[683px]">
          <Breadcrumb
  variant="figma"
  items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
/>

          <h1 className="w-full break-words font-space-grotesk font-bold text-[#020816] dark:text-white text-[32px] leading-[42px] tracking-[-0.5px] md:text-[72px] md:leading-[85px]">
            Sense PC Gives You the Power of High-Performing Hardware Without The Cost
          </h1>
          <p className="w-full font-inter font-normal text-base text-[#7D7D7D] dark:text-[#B9C2D5] md:text-[24px] md:leading-[40px] md:tracking-[-0.4px]">
            Get the advanced workstation experience without the hardware or the cost.
            Sense PC gives you a cloud-native remote desktop that you can access whenever
            you want, from any device.
          </p>

        </div>
      </Hero>

      <MissionCard />
      <WhoWeServeSection />

      <GetStartedCTA
        padding="px-4 py-20 md:px-6 md:py-16 mb-16 md:mb-32"
        gradient={
          <img
              src="/assets/svg/about/Ellipse 2-big.svg"
              alt=""
              aria-hidden="true"
              className="
                pointer-events-none select-none
                absolute left-1/2 top-0
                -translate-x-1/2 -translate-y-[55%]
                z-0
                hidden dark:md:block
              "
            />
        }
      >
        <p className="font-space-grotesk font-semibold text-[48px] leading-[56px] tracking-[-1px] text-[#020816] dark:text-white text-center">
          Join the Next Generation of Cloud Computing
        </p>

        <div className="mt-6 mx-auto max-w-[57rem] space-y-4 whitespace-pre-wrap text-center font-inter text-[18px] font-normal leading-[32px] tracking-[-0.3px] text-[#7D7D7D] dark:text-[#B9C2D5]">
          <p>
            We proudly work with teams, investors, and innovators who share our
            vision of advanced cloudnative computing. If you’re building tools,
            exploring integrations, or shaping new ideas, we’d love to connect.
          </p>

          <p className="text-[#020816] dark:text-white dark:font-medium dark:leading-[27px]">
            If you’d like to partner, explore investment, or share feedback,
            we’re always open to new conversations.
          </p>
        </div>

        <div className="relative mt-10 flex justify-center">
          <Button
            size="lg"
            className="relative z-10 w-full text-base md:w-auto"
            onClick={() => console.log("Navigate to Contact Page")}
          >
            Contact Us
            <ArrowUpRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </GetStartedCTA>

      {pathname === "/" && (
        <div className="relative h-1 w-full">
          <div className="pointer-events-none absolute left-1/2 top-2/3 h-80 w-full -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/assets/svg/about/partner-us-shape-3.png"
              alt="Gradient"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
}
