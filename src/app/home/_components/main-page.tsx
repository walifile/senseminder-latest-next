"use client";

import RentSmarter from "@/app/home/_components/RentSmarter";

import FAQ from "./faq";
import Hero from "./hero";
import { MainLayout } from "./layout";
import HowItWorks from "./how-it-works";
import SensePCCost from "./sensepc-cost";
import FutureVision from "./future-vision";
import WayWeCompute from "./way-we-compute";
import GetStartedCTA from "./get-started-cta";
import CostCalculator from "./cost-calculator";
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
      {/* <WhySettle /> */}
      {/*<ProblemSolution />*/}
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
