import type { Metadata } from "next";

import { compareWindows365Meta } from "@/app/seo/metadata";
import { makeCompareJsonLd } from "@/app/seo/schema/compare";
import { comparisons } from "@/app/compare/_data/comparisons";
import ComparisonPage from "@/app/compare/_components/comparison-page";

const data = comparisons["sensepc-vs-windows-365"];

export const metadata: Metadata = {
  title: compareWindows365Meta.title,
  description: compareWindows365Meta.description,
  keywords: compareWindows365Meta.keywords,
  alternates: {
    canonical: "/compare/sensepc-vs-windows-365",
  },
  openGraph: {
    title: compareWindows365Meta.title,
    description: compareWindows365Meta.description,
    url: "/compare/sensepc-vs-windows-365",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC vs Windows 365",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: compareWindows365Meta.title,
    description: compareWindows365Meta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC vs Windows 365",
      },
    ],
  },
};

export default function SensepcVsWindows365Page() {
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
