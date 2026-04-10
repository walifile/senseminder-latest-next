import React from "react";
import ProductFeatureGridSection, {
  type ProductFeatureGridItem,
} from "@/app/products/_components/product-feature-grid-section";

import ProductFeatureCard from "./product-feature-card";

const FEATURES: ProductFeatureGridItem[] = [
  {
    title: "Native to Sense PC",
    description:
      "Your files live in the same environment as your cloud desktops. They are fast, secure, and always in sync.",
    iconSrc: "/assets/product/sensecloud/cloud-data.svg",
    iconAlt: "Flash",
  },
  {
    title: "Built for Organization",
    description:
      "Keep everything structured with tagging, metadata, and clean workspace-level organization.",
    iconSrc: "/assets/product/sensecloud/data-searching.svg",
    iconAlt: "Union",
  },
  {
    title: "Scales Instantly",
    description:
      "Grow from gigabytes to terabytes without lifting a finger. No migrations. No downtime.",
    iconSrc: "/assets/product/sensecloud/full-screen.svg",
    iconAlt: "Card Union",
  },
  {
    title: "Safe by Default",
    description:
      "Versioning and recovery tools make it easy to reverse mistakes and protect your data.",
    iconSrc: "/assets/product/sensecloud/data-recovery.svg",
    iconAlt: "Cyber Security",
  },
];

const WhyTeamsChoose = () => (
  <ProductFeatureGridSection
    title="Why Sense Cloud for Storage"
    items={FEATURES}
    CardComponent={ProductFeatureCard}
  />
);

export default WhyTeamsChoose;
