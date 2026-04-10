import type { Metadata } from "next";
import type { ReactNode } from "react";

import { senseCloudMeta } from "@/app/seo/metadata";
import { senseCloudPageJsonLd } from "@/app/seo/schema/sense-cloud";

const senseCloudPageTitle = "Sense Cloud Intelligent Tier | Sense PC";
const senseCloudPageDescription =
  "Explore Sense Cloud Intelligent Tier storage with auto-tier pricing, secure storage, and quick setup for your Sense PC workflow.";

export const metadata: Metadata = {
  title: senseCloudPageTitle,
  description: senseCloudPageDescription,
  keywords: senseCloudMeta.keywords,
  alternates: {
    canonical: "/sense-cloud",
  },
  openGraph: {
    title: senseCloudPageTitle,
    description: senseCloudPageDescription,
    url: "/sense-cloud",
    type: "website",
    images: ["/sensepc-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: senseCloudPageTitle,
    description: senseCloudPageDescription,
    images: ["/sensepc-logo.png"],
  },
};

export default function SenseCloudLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(senseCloudPageJsonLd) }}
      />
      {children}
    </>
  );
}
