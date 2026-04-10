import type { Metadata } from "next";

import { buildSensePcMeta } from "@/app/seo/metadata";
import { buildSensePcJsonLd } from "@/app/seo/schema/build-sensepc";

export const metadata: Metadata = {
  title: buildSensePcMeta.title,
  description: buildSensePcMeta.description,
  keywords: buildSensePcMeta.keywords,
  alternates: {
    canonical: "/build-sensepc",
  },
  openGraph: {
    title: buildSensePcMeta.title,
    description: buildSensePcMeta.description,
    url: "/build-sensepc",
    type: "website",
    images: ["/sensepc-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: buildSensePcMeta.title,
    description: buildSensePcMeta.description,
    images: ["/sensepc-logo.png"],
  },
};

export default function BuildSensePcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSensePcJsonLd) }}
      />
      {children}
    </>
  );
}
