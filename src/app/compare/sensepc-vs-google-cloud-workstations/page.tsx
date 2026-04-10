import type { Metadata } from "next";

import { makeCompareJsonLd } from "@/app/seo/schema/compare";
import { comparisons } from "@/app/compare/_data/comparisons";
import ComparisonPage from "@/app/compare/_components/comparison-page";
import { compareGoogleCloudWorkstationsMeta } from "@/app/seo/metadata";

const data = comparisons["sensepc-vs-google-cloud-workstations"];

export const metadata: Metadata = {
  title: compareGoogleCloudWorkstationsMeta.title,
  description: compareGoogleCloudWorkstationsMeta.description,
  keywords: compareGoogleCloudWorkstationsMeta.keywords,
  alternates: {
    canonical: "/compare/sensepc-vs-google-cloud-workstations",
  },
  openGraph: {
    title: compareGoogleCloudWorkstationsMeta.title,
    description: compareGoogleCloudWorkstationsMeta.description,
    url: "/compare/sensepc-vs-google-cloud-workstations",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC vs Google Cloud Workstations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: compareGoogleCloudWorkstationsMeta.title,
    description: compareGoogleCloudWorkstationsMeta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC vs Google Cloud Workstations",
      },
    ],
  },
};

export default function SensepcVsGoogleCloudWorkstationsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(makeCompareJsonLd(data)) }}
      />
      <ComparisonPage data={data} />
    </>
  );
}
