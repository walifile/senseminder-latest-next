import React from "react";

import Hero from "./hero";
import { MainLayout } from "./layout";
import RealWorld from "./real-world-use";
import GetStartedCTA from "./get-started-cta";
import WhyTeamsChoose from "./why-teams-choose";
import RentSmarterProcess from "./how-it-works";

const SensePCPage = () => (
  <MainLayout>
    <Hero />
    <WhyTeamsChoose />
    <RentSmarterProcess />
    <RealWorld />
    <GetStartedCTA />
  </MainLayout>
);

export default SensePCPage;
