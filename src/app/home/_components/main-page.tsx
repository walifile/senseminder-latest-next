"use client";

import RentSmarter from "@/app/home/_components/RentSmarter";

import FAQ from "./faq";
import Hero from "./hero";
import { MainLayout } from "./layout";
import SensePCCost from "./sensepc-cost";
import WayWeCompute from "./way-we-compute";
import GetStartedCTA from "./get-started-cta";
import CostCalculator from "./cost-calculator";
import TutorialSection from "./tutorial-section";
import ProductHighlights from "./product-highlights";
import FutureOfComputing from "./future-of-computing";
import RentSmarterProcess from "@/app/home/_components/RentSmarterProcess";

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <FutureOfComputing />
      <WayWeCompute />
      <ProductHighlights />
      <TutorialSection />
      <RentSmarter />
        <RentSmarterProcess />
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
      <SensePCCost />
      <FAQ />
    </MainLayout>
  );
}
