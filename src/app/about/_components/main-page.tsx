import Link from "next/link";
import { MainLayout } from "@/app/home/_components/main-layout";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { AboutHero } from "./about-hero";
import { MissionCard } from "./mission-card";
import { WhoWeServeSection } from "./who-we-serve-section";
import GetStartedCTA from "../../home/_components/get-started-cta";

export default function AboutPage() {
  return (
    <MainLayout>
      <AboutHero />

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
        <h3 className="font-space-grotesk font-semibold text-2xl md:text-5xl text-[#020816] dark:text-white text-center">
          Join the Next Generation of Cloud Computing
        </h3>

        <div className="mt-6 mx-auto max-w-[57rem] space-y-4 whitespace-pre-wrap text-center font-inter text-[18px] font-normal leading-[32px] tracking-[-0.3px] text-[#7D7D7D] dark:text-[#B9C2D5]">
          <p>
            We proudly work with teams, investors, and innovators who share our
            vision of advanced cloudnative computing. If you're building tools,
            exploring integrations, or shaping new ideas, we'd love to connect.
          </p>

          <p className="text-[#020816] dark:text-white dark:font-medium dark:leading-[27px]">
            If you'd like to partner, explore investment, or share feedback,
            we're always open to new conversations.
          </p>
        </div>

        <div className="relative mt-10 flex justify-center">
          <Button
            asChild
            size="lg"
            className="relative z-10 w-full text-base md:w-auto"
          >
            <Link href="/contact">
              Contact Us
              <ArrowUpRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </GetStartedCTA>
    </MainLayout>
  );
}
