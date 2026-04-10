import type { Metadata } from "next";

import { senseCloudMeta } from "@/app/seo/metadata";
import { senseCloudJsonLd } from "@/app/seo/schema/sensecloud";

export const metadata: Metadata = {
  title: senseCloudMeta.title,
  description: senseCloudMeta.description,
  keywords: senseCloudMeta.keywords,
  alternates: {
    canonical: "/products/sensecloud",
  },
  openGraph: {
    title: senseCloudMeta.title,
    description: senseCloudMeta.description,
    url: "/products/sensecloud",
    type: "website",
    images: ["/sensepc-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: senseCloudMeta.title,
    description: senseCloudMeta.description,
    images: ["/sensepc-logo.png"],
  },
};

export default function SenseCloudLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(senseCloudJsonLd) }}
      />
      {children}
    </>
  );
}
