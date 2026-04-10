import type { Metadata } from "next";

import { compareShadowPCMeta } from "@/app/seo/metadata";
import { makeCompareJsonLd } from "@/app/seo/schema/compare";
import { comparisons } from "@/app/compare/_data/comparisons";
import ComparisonPage from "@/app/compare/_components/comparison-page";

const data = comparisons["sensepc-vs-shadow-pc"];

export const metadata: Metadata = {
  title: compareShadowPCMeta.title,
  description: compareShadowPCMeta.description,
  keywords: compareShadowPCMeta.keywords,
  alternates: {
    canonical: "/compare/sensepc-vs-shadow-pc",
  },
  openGraph: {
    title: compareShadowPCMeta.title,
    description: compareShadowPCMeta.description,
    url: "/compare/sensepc-vs-shadow-pc",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC vs Shadow PC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: compareShadowPCMeta.title,
    description: compareShadowPCMeta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC vs Shadow PC",
      },
    ],
  },
};

export default function SensepcVsShadowPCPage() {
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
