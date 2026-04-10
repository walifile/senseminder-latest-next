import type { Metadata } from "next";

import { pricingMeta } from "@/app/seo/metadata";
import { pricingJsonLd } from "@/app/seo/schema/pricing";

import MainPage from "./_components/main-page";

export const metadata: Metadata = {
  title: pricingMeta.title,
  description: pricingMeta.description,
  keywords: pricingMeta.keywords,
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: pricingMeta.title,
    description: pricingMeta.description,
    url: "/pricing",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC Pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pricingMeta.title,
    description: pricingMeta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC Pricing",
      },
    ],
  },
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <MainPage />
    </>
  );
}
