"use client";


import FAQ from "./faq";
import Hero from "./hero";
import { MainLayout } from "./layout";
import HowItWorks from "./how-it-works";
import FutureVision from "./future-vision";
import CostCalculator from "./cost-calculator";
import ProblemSolution from "./problem-solution";
import TutorialSection from "./tutorial-section";


export default function HomePage() {
 

  return (
    <MainLayout>
      <Hero />
      <TutorialSection />
      {/* <WhySettle /> */}
      <ProblemSolution />
      <HowItWorks />
      <FutureVision />
      {/* <WhyChooseUs /> */}
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      <CostCalculator />
      <FAQ />
    </MainLayout>
  );
}
