import type { Metadata } from "next";

import { compareCitrixDaaSMeta } from "@/app/seo/metadata";
import { makeCompareJsonLd } from "@/app/seo/schema/compare";
import { comparisons } from "@/app/compare/_data/comparisons";
import ComparisonPage from "@/app/compare/_components/comparison-page";

const data = comparisons["sensepc-vs-citrix-daas"];

export const metadata: Metadata = {
  title: compareCitrixDaaSMeta.title,
  description: compareCitrixDaaSMeta.description,
  keywords: compareCitrixDaaSMeta.keywords,
  alternates: {
    canonical: "/compare/sensepc-vs-citrix-daas",
  },
  openGraph: {
    title: compareCitrixDaaSMeta.title,
    description: compareCitrixDaaSMeta.description,
    url: "/compare/sensepc-vs-citrix-daas",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC vs Citrix DaaS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: compareCitrixDaaSMeta.title,
    description: compareCitrixDaaSMeta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC vs Citrix DaaS",
      },
    ],
  },
};

export default function SensepcVsCitrixDaaSPage() {
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
