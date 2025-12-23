"use client";

import React from "react";
import FAQ from "@/app/home/_components/faq";
import { GetStartedCtaSection } from "@/app/products/_components/get-started-cta-section";
import RealWorldUse, {
  type RealWorldUseItem,
} from "@/app/products/_components/real-world-use";

import { useGetStartedNav } from "@/hooks/use-get-started";

import Hero from "./hero";
import { MainLayout } from "./layout";
import WhyTeamsChoose from "./why-teams-choose";
import RentSmarterProcess from "./how-it-works";
import SmartStoragePricing from "./sensepc-pricing";

const senseCloudFaqItems = [
  {
    question: "What is SensePC?",
    answer:
      "SensePC is a cloud desktop service that lets you run a full computer in the cloud and access it from any device with a secure connection.",
  },
  {
    question: "Do I need powerful hardware to use it?",
    answer: "No. A stable internet connection and a modern browser. That’s it.",
  },
  {
    question: "Can teams use SensePC?",
    answer:
      "Yes. SensePC supports individuals, small teams, and larger organizations with centralized billing, access controls, and admin tools.",
  },
  {
    question: "How does billing work?",
    answer:
      "Load funds onto your wallet and choose hourly, daily, or monthly billing for each cloud PC. Storage is billed based on usage and the tier you choose.",
  },
];

const REAL_WORLD_ITEMS: RealWorldUseItem[] = [
  {
    title: "Remote Work & Freelancers",
    description:
      "Access to your full cloud PC from anywhere and leave the heavy hardware behind. Log in from any device and pick up your work exactly where you left off.",
    imageSrc: "/assets/product/remote.svg",
  },
  {
    title: "Teams & Small Businesses",
    description:
      "Give every team member a consistent desktop, manage costs from one place, and onboard new users in minutes. No setups, imaging, or hardware to ship.",
    imageSrc: "/assets/product/team.svg",
  },
  {
    title: "Developers & Builders",
    description:
      "Launch dev-ready environments with the specs you need. No dependency issues, no local bottlenecks, and no OS conflicts slowing projects down.",
    imageSrc: "/assets/product/developer.svg",
  },
  {
    title: "Students & Learners",
    description:
      "Run demanding software from any budget device. Your cloud desktop handles the computing, so you don’t need an expensive laptop.",
    imageSrc: "/assets/product/student.svg",
  },
];

const HEADING_FONT =
  "justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8";

const SensePCPage = () => {
  const onGetStarted = useGetStartedNav();

  return (
    <MainLayout>
      {/* ✅ apply the heading font to the main page wrapper so headings inside
          these sections inherit if they use `inherit` / default text styles */}
      <div className="w-full">
        {/* If your shared components don’t inherit font-family,
            apply the class on their heading nodes inside each component. */}
        <div className={HEADING_FONT} style={{ display: "contents" }}>
          <Hero />
          <WhyTeamsChoose />
          <RentSmarterProcess />

          <RealWorldUse
            heading="Desktop Cloud Computing Made to Fit Your Workflow"
            items={REAL_WORLD_ITEMS}
          />

          <SmartStoragePricing />

          <FAQ
            items={senseCloudFaqItems}
            subtitle="Everything you need to know about SensePC"
          />

          <GetStartedCtaSection
            title="Power your Sense PC with secure storage."
            description="WGet started by choosing the storage option that fits your work. "
            primaryCta={{
              label: "Get Started with SensePC",
              onClick: onGetStarted,
            }}
            secondaryCta={{ label: "Contact Sales", onClick: onGetStarted }}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default SensePCPage;
