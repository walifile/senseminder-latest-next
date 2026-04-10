import React from "react";
import ProductFeatureGridSection, {
  type ProductFeatureGridItem,
} from "@/app/products/_components/product-feature-grid-section";

import ProductFeatureCard from "./product-feature-card";

const FEATURES: ProductFeatureGridItem[] = [
  {
    title: "Build Your Cloud PC in Minutes",
    description:
      "Create a ready-to-use cloud workstation without hardware, setup, or maintenance.",
    iconSrc: "/assets/product/flash.svg",
    iconAlt: "Flash",
  },
  {
    title: "Your Desktop Goes With You",
    description:
      "Run your apps on secure desktop cloud computing from any device, even low-spec ones.",
    iconSrc: "/assets/product/Union.svg",
    iconAlt: "Union",
  },
  {
    title: "Billing Built for Your Reality",
    description:
      "Scale at your convenience and only pay for what you use, not what's running in the background.",
    iconSrc: "/assets/product/cardunion.svg",
    iconAlt: "Card Union",
  },
  {
    title: "Security That Stays Out of Your Way",
    description:
      "You get a virtual desktop alternative hardened by encryption and controlled access.",
    iconSrc: "/assets/product/cyber.svg",
    iconAlt: "Cyber Security",
  },
];

const HEADING_FONT =
  "justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8";

const WhyTeamsChoose = () => (
  <ProductFeatureGridSection
    title="Why teams choose SensePC"
    items={FEATURES}
    CardComponent={ProductFeatureCard}
    titleClassName={`${HEADING_FONT} tracking-[-1px]`}
    itemTitleClassName={`${HEADING_FONT} text-[18px] font-semibold leading-8`}
  />
);

export default WhyTeamsChoose;
