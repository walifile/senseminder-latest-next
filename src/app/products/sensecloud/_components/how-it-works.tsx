"use client";

import React from "react";
import ProductHowItWorks, {
  type ProductHowItWorksStep,
} from "@/app/products/_components/product-how-it-works";

const HEADING_FONT =
  "justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8";

const steps: ProductHowItWorksStep[] = [
  {
    step: "STEP-1",
    icon: "connection_x",
    title: "Sense Cloud Is Ready in Your Account",
    description:
      "Your file storage is available as soon as you sign in - no setup needed.",
  },
  {
    step: "STEP-2",
    icon: "settings_x",
    title: "Store & Manage Your Files",
    description:
      "Upload, organize, and access files anytime with built-in duplicate detection to keep things clean.",
  },
  {
    step: "STEP-3",
    icon: "Union_x",
    title: "Backup from SensePC Anytime",
    description:
      "Move important files from your SensePC into Sense Cloud whenever you want - billing tiers scale automatically with usage.",
  },
];

const RentSmarterProcess: React.FC = () => (
  <ProductHowItWorks
    title="How Sense Cloud Works"
    steps={steps}
    titleClassName={`${HEADING_FONT} md:text-5xl`}
    stepLabelClassName={`${HEADING_FONT} text-xl leading-6`}
    containerClassName="grid lg:grid-cols-5 gap-8 md:gap-24"
  />
);

export default RentSmarterProcess;
