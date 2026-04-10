import type { Metadata } from "next";

import { makeCompareJsonLd } from "@/app/seo/schema/compare";
import { comparisons } from "@/app/compare/_data/comparisons";
import { compareAmazonWorkspacesMeta } from "@/app/seo/metadata";
import ComparisonPage from "@/app/compare/_components/comparison-page";

const data = comparisons["sensepc-vs-amazon-workspaces"];

export const metadata: Metadata = {
  title: compareAmazonWorkspacesMeta.title,
  description: compareAmazonWorkspacesMeta.description,
  keywords: compareAmazonWorkspacesMeta.keywords,
  alternates: {
    canonical: "/compare/sensepc-vs-amazon-workspaces",
  },
  openGraph: {
    title: compareAmazonWorkspacesMeta.title,
    description: compareAmazonWorkspacesMeta.description,
    url: "/compare/sensepc-vs-amazon-workspaces",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC vs Amazon WorkSpaces",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: compareAmazonWorkspacesMeta.title,
    description: compareAmazonWorkspacesMeta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC vs Amazon WorkSpaces",
      },
    ],
  },
};

export default function SensepcVsAmazonWorkspacesPage() {
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
