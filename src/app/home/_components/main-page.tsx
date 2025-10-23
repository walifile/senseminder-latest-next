"use client";

import RentSmarter from "@/app/home/_components/RentSmarter";
import RentSmarterProcess from "@/app/home/_components/RentSmarterProcess";

import FAQ from "./faq";
import Hero from "./hero";
import { MainLayout } from "./layout";
import SensePCCost from "./sensepc-cost";
import WayWeCompute from "./way-we-compute";
import GetStartedCTA from "./get-started-cta";
import TutorialSection from "./tutorial-section";
import ProductHighlights from "./product-highlights";
import FutureOfComputing from "./future-of-computing";

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
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
      <GetStartedCTA />
      <RentSmarterProcess />
      <SensePCCost />
      <FAQ />
    </MainLayout>
  );
}
