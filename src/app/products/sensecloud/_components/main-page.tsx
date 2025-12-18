import React from "react";
import FAQ from "@/app/home/_components/faq";

import Hero from "./hero";
import { MainLayout } from "./layout";
import RealWorld from "./real-world-use";
import GetStartedCTA from "./get-started-cta";
import WhyTeamsChoose from "./why-teams-choose";
import RentSmarterProcess from "./how-it-works";
import SmartStoragePricing from "./smartstorage-pricing";

const senseCloudFaqItems = [
  {
    question: "What is Sense Cloud?",
    answer:
      "Sense Cloud is the storage system for Sense PC. It keeps all your files, projects, and backups in one secure place that works seamlessly with your cloud desktops.",
  },
  {
    question: "Do I need Sense PC to use Sense Cloud?",
    answer:
      "Right now, Sense Cloud works best when used with Sense PC. In the future, you'll also be able to use it directly with other tools and apps.",
  },
  {
    question: "How is Sense Cloud billed?",
    answer:
      "You pay for the amount of storage you use. Pricing adjusts automatically based on your usage or the plan you choose, and all charges show up in your Sense PC wallet.",
  },
  {
    question: "Is my data encrypted?",
    answer:
      "Yes. Your files are protected with encryption, and access is controlled to keep your data secure.",
  },
];

const SensePCPage = () => (
  <MainLayout>
    <Hero />
    <WhyTeamsChoose />
    <RentSmarterProcess />
    <RealWorld />
    <SmartStoragePricing />
    <FAQ
      items={senseCloudFaqItems}
      subtitle="Everything you need to know about Sense Cloud"
    />
    <GetStartedCTA />
  </MainLayout>
);

export default SensePCPage;
