"use client";

import FAQ from "./faq";
import Hero from "./hero";
import { MainLayout } from "./layout";
import HowItWorks from "./how-it-works";
import SensePCCost from "./sensepc-cost";
import FutureVision from "./future-vision";
import WayWeCompute from "./way-we-compute";
import GetStartedCTA from "./get-started-cta";
import CostCalculator from "./cost-calculator";
import ProblemSolution from "./problem-solution";
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
      {/* <WhySettle /> */}
      <ProblemSolution />
      <HowItWorks />
      <FutureVision />
      {/* <WhyChooseUs /> */}
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      <CostCalculator />
      <GetStartedCTA />
      <SensePCCost />
      <FAQ />
    </MainLayout>
  );
}
