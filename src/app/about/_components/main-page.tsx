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
        textMinWidth={683}
        imageSrc="/assets/svg/about-hero-dark.svg"
        imageWidth={600}
        imageHeight={400}
        imageAlt="About illustration"
      >
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        />
        <p className="font-space-grotesk font-bold text-3xl md:text-[65px] leading-[1] my-3 w-full">
          About SensePC
        </p>
        <p className="text-paragraph text-base md:text-2xl md:leading-[2.5rem] w-full">
          At Sensepc, we’re redefining computing by delivering
          high-performance, fully managed cloud computer that remove the need
          for traditional hardware.
        </p>
      </Hero>
      <MissionCard />
      <WhoWeServeSection />
      <GetStartedCTA
        padding="px-4 py-20 md:px-6 md:py-16 mb-16 md:mb-32"
        gradient={
          <div className="pointer-events-none absolute w-[680px] h-[680px] top-2/3 left-1/2 -translatex-1/2 -translate-y-1/2">
            <Image
              // src="/assets/svg/about/partner-us-shape-1-bg.png"
              src="/assets/svg/about/partner-us-shape-1.png"
              alt="Gradient"
              fill
              className="object-contain hidden dark:block"
              priority
            />
          </div>
        }
      >
        {/* Title */}
        <h2 className="font-space-grotesk text-[#020816] dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-l dark:from-indigo-400 dark:via-indigo-600 dark:to-fuchsia-400 text-3xl md:text-5xl font-semibold leading-10 md:leading-[56px]">
          Partner With Us
        </h2>

        {/* Description */}
        <div className="mt-6 space-y-4 text-base md:text-lg text-[#7D7D7D] dark:text-[#C8D3F5] leading-6 md:leading-8 font-normal max-w-[57rem] mx-auto">
          <p>
            At{" "}
            <span className="font-semibold dark:text-white text-[#020816] font-space-grotesk">
              Senseminder
            </span>
            , we believe in growing through collaboration, feedback, and shared
            vision. We welcome investors, partners, and innovators who are
            excited to shape the future of cloud-native computing with us.
          </p>

          <p className="max-w-[56rem] mx-auto">
            Whether you're looking to invest, collaborate, or support our
            mission — or simply want to share an idea{" "}
            <span className="font-semibold dark:text-white text-[#020816] font-space-grotesk">
              — we value your opinion and welcome your suggestions for
              improvement.
            </span>
          </p>
        </div>

        {/* CTA Button */}
        <div className="mt-10 relative flex justify-center">
          <Button
            size="lg"
            className="relative z-10 text-base w-full md:w-auto"
            onClick={() => console.log("Navigate to Contact Page")}
          >
            Contact Us
            <ArrowUpRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </GetStartedCTA>
      {pathname === "/" && (
        <div className="relative w-full h-1">
          <div className="pointer-events-none absolute w-full h-80 top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image
              // src="/assets/svg/about/partner-us-shape-3-bg.png"
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
