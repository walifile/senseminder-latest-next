"use client";

 
import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react";

import { useGetStartedNav } from "@/hooks/use-get-started";

import FAQ from "./faq";
import Hero from "./hero";
import { MainLayout } from "./layout";
import SensePCCost from "./sensepc-cost";
import RentSmarter from "./rent-smarter";
import WayWeCompute from "./way-we-compute";
import GetStartedCTA from "./get-started-cta";
import TutorialSection from "./tutorial-section";
import ProductHighlights from "./product-highlights";
import FutureOfComputing from "./future-of-computing";
import RentSmarterProcess from "./rent-smarter-process";

export default function HomePage() {
  const onGetStarted = useGetStartedNav();
  return (
    <MainLayout>
      <Hero
        imageSrc="/assets/svg/hero-img-dark.svg"
        imageWidth={600}
        imageHeight={400}
        imageAlt="Cloud infrastructure illustration"
      >
        <p className="font-space-grotesk font-bold text-2xl md:text-[65px] leading-[1.10] w-full md:w-[85%]">
          <span className="text-transparent bg-clip-text bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]">
            Your Computer,
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]">
            Now in the Cloud
          </span>
        </p>
        <p className="text-paragraph text-base md:text-2xl w-full md:w-[85%]">
          Build a high-performing cloud computer in minutes with Sense PC. No hardware. No security threat. No overpaying.
        </p>
      </Hero>
      <FutureOfComputing />
      <WayWeCompute />
      <ProductHighlights />
      <TutorialSection />
      <RentSmarter />
      {/* <TutorialSection /> */}
      {/* <WhySettle /> */}
      {/* <ProblemSolution />
      <HowItWorks />
      <FutureVision /> */}
      {/*<ProblemSolution />*/}
      {/*<HowItWorks />*/}
      {/*<FutureVision />*/}
      {/* <WhyChooseUs /> */}
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      {/* <CostCalculator /> */}
      <GetStartedCTA>
        <h3 className="font-space-grotesk font-semibold text-2xl md:text-5xl">
          Join The New Cloud Computing Movement
          <br />
        </h3>

        <Button size="lg" className="w-full md:w-fit" onClick={onGetStarted}>
          Switch to Sense PC
          <ArrowUpRight />
        </Button>
      </GetStartedCTA>
      <RentSmarterProcess />
      <SensePCCost />
      <FAQ />
    </MainLayout>
  );
}


