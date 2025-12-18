import React from "react";

import Hero from "./hero";
import { MainLayout } from "./layout";
import RealWorld from "./real-world-use";
import GetStartedCTA from "./get-started-cta";
import WhyTeamsChoose from "./why-teams-choose";
import RentSmarterProcess from "./how-it-works";
import FAQ from "@/app/home/_components/faq";

const SensePCPage = () => (
  <MainLayout>
    <Hero />
    <WhyTeamsChoose />
    <RentSmarterProcess />
    <RealWorld />
    <FAQ />
    <GetStartedCTA />
  </MainLayout>
);

export default SensePCPage;
