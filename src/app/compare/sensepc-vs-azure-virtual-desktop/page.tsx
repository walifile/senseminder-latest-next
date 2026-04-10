import type { Metadata } from "next";

import { makeCompareJsonLd } from "@/app/seo/schema/compare";
import { comparisons } from "@/app/compare/_data/comparisons";
import { compareAzureVirtualDesktopMeta } from "@/app/seo/metadata";
import ComparisonPage from "@/app/compare/_components/comparison-page";

const data = comparisons["sensepc-vs-azure-virtual-desktop"];

export const metadata: Metadata = {
  title: compareAzureVirtualDesktopMeta.title,
  description: compareAzureVirtualDesktopMeta.description,
  keywords: compareAzureVirtualDesktopMeta.keywords,
  alternates: {
    canonical: "/compare/sensepc-vs-azure-virtual-desktop",
  },
  openGraph: {
    title: compareAzureVirtualDesktopMeta.title,
    description: compareAzureVirtualDesktopMeta.description,
    url: "/compare/sensepc-vs-azure-virtual-desktop",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC vs Azure Virtual Desktop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: compareAzureVirtualDesktopMeta.title,
    description: compareAzureVirtualDesktopMeta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC vs Azure Virtual Desktop",
      },
    ],
  },
};

export default function SensepcVsAzureVirtualDesktopPage() {
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
