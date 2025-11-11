"use client";

 

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


