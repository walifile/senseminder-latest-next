import React from "react";

import Hero from "./hero";
import WhyTeamsChoose from "./why-teams-choose";
import { MainLayout } from "./layout";
import RentSmarterProcess from "./how-it-works";
import RealWorld from "./real-world-use";

const SensePCPage = () => {
  return (
    <MainLayout>
      <Hero />
      <WhyTeamsChoose />
      <RentSmarterProcess />
      <RealWorld />
    </MainLayout>
  );
};

export default SensePCPage;
