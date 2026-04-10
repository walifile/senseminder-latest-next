"use client";

import React from "react";
import ProductHowItWorks, {
  type ProductHowItWorksStep,
} from "@/app/products/_components/product-how-it-works";

const steps: ProductHowItWorksStep[] = [
  {
    step: "STEP-1",
    icon: "/cloudserver",
    title: "Set Up Your Cloud PC",
    description:
      "Customize the power you need to fit your project. CPU, memory, storage, and OS-the way you like. Automate uptime and idle behavior to control cost.",
  },
  {
    step: "STEP-2",
    icon: "/circular",
    title: "Get to Work in SECONDS",
    description:
      "Launch your cloud desktop from any browser. Your apps and files live in the cloud, ready when you need them.",
  },
  {
    step: "STEP-3",
    icon: "/computer1",
    title: "Adapt As Your Work Changes",
    description:
      "Increase resources, pause machines, or add new workstations anytime. SensePC grows with your workflow, not the other way around.",
  },
];

const HEADING_FONT =
  "justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8";

const RentSmarterProcess: React.FC = () => (
  <ProductHowItWorks
    title="How SensePC works"
    steps={steps}
    titleClassName={`${HEADING_FONT} md:text-4xl`}
  />
);

export default RentSmarterProcess;
