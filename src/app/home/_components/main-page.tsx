"use client";

import FAQ from "./faq";
import Hero from "./hero";
import { MainLayout } from "./layout";
import SensePCCost from "./sensepc-cost";
import WayWeCompute from "./way-we-compute";
import GetStartedCTA from "./get-started-cta";
import ProductHighlights from "./product-highlights";
import FutureOfComputing from "./future-of-computing";

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <FutureOfComputing />
      <WayWeCompute />
      <ProductHighlights />
      {/* <TutorialSection /> */}
      {/* <WhySettle /> */}
      {/* <ProblemSolution />
      <HowItWorks />
      <FutureVision /> */}
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
