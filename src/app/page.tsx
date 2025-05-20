"use client";

import CostCalculator from "./home/_components/cost-calculator";
import FAQ from "./home/_components/faq";
import FutureVision from "./home/_components/future-vision";
import Hero from "./home/_components/hero";
import HowItWorks from "./home/_components/how-it-works";
import { MainLayout } from "./home/_components/layout";
import Pricing from "./home/_components/pricing";
import ProblemSolution from "./home/_components/problem-solution";
import Testimonials from "./home/_components/testimonials";
import TutorialSection from "./home/_components/tutorial-section";
import WhyChooseUs from "./home/_components/why-choose-us";
import WhySettle from "./home/_components/why-settle";

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <TutorialSection />
      <WhySettle />
      <ProblemSolution />
      <HowItWorks />
      <FutureVision />
      <WhyChooseUs />
      <Testimonials />
      <Pricing />
      <CostCalculator />
      <FAQ />
    </MainLayout>
  );
}
