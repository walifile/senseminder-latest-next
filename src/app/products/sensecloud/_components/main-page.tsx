import React from "react";
import FAQ from "@/app/home/_components/faq";
import { MainLayout } from "@/app/home/_components/main-layout";
import { GetStartedCtaActions } from "@/app/products/_components/get-started-cta-actions";
import { GetStartedCtaSection } from "@/app/products/_components/get-started-cta-section";
import SenseCloudPricingSection from "@/app/products/_components/sensecloud-pricing-section";
import RealWorldUse, {
  type RealWorldUseItem,
} from "@/app/products/_components/real-world-use";

import Hero from "./hero";
import WhyTeamsChoose from "./why-teams-choose";
import RentSmarterProcess from "./how-it-works";

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

const REAL_WORLD_ITEMS: RealWorldUseItem[] = [
  {
    title: "Project & Workspace Storage",
    description:
      "Keep each project or team workspace backed by its own storage namespace, with predictable access patterns and cost.",
    imageSrc: "/assets/product/sensecloud/Frame(3).svg",
  },
  {
    title: "Backups & Snapshots",
    description:
      "Use SenseCloud as the backbone for desktop snapshots, file backups, and long-term archives.",
    imageSrc: "/assets/product/sensecloud/Frame.svg",
  },
  {
    title: "Media & Asset Libraries",
    description:
      "Store large design files, marketing assets, and media libraries centrally so they’re always available from any SensePC.",
    imageSrc: "/assets/product/sensecloud/Frame(1).svg",
  },
  {
    title: "Data for Analytics & AI ",
    description:
      "Give your analytics or AI workloads a consistent place to read from and write to, alongside your SensePC compute.",
    imageSrc: "/assets/product/sensecloud/Frame(2).svg",
  },
];

const SenseCloudPage = () => (
  <MainLayout>
    <Hero />
    <WhyTeamsChoose />
    <RentSmarterProcess />

    <RealWorldUse
      heading="Cloud Storage Solutions That Make Sense"
      items={REAL_WORLD_ITEMS}
    />

    <SenseCloudPricingSection />

    <FAQ
      items={senseCloudFaqItems}
      subtitle="Everything you need to know about Sense Cloud"
    />

    <GetStartedCtaSection
      title="Power your Sense PC with secure storage."
      description="Get started by choosing the storage option that fits your work."
      actions={
        <GetStartedCtaActions
          primaryLabel="Get Started with SensePC"
          secondaryLabel="Contact Sales"
        />
      }
    />
  </MainLayout>
);

export default SenseCloudPage;
