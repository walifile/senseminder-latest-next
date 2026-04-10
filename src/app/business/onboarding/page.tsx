import type { Metadata } from "next";

import { businessOnboardingMeta } from "@/app/seo/metadata";
import { businessOnboardingJsonLd } from "@/app/seo/schema/business-onboarding";

import TeamOnboarding from "./_components/onboarding";

export const metadata: Metadata = {
  title: businessOnboardingMeta.title,
  description: businessOnboardingMeta.description,
  keywords: businessOnboardingMeta.keywords,
  alternates: {
    canonical: "/business/onboarding",
  },
  openGraph: {
    title: businessOnboardingMeta.title,
    description: businessOnboardingMeta.description,
    url: "/business/onboarding",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC Business Onboarding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: businessOnboardingMeta.title,
    description: businessOnboardingMeta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC Business Onboarding",
      },
    ],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessOnboardingJsonLd),
        }}
      />
      <TeamOnboarding />
    </>
  );
}
