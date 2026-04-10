import type { Metadata } from "next";

import { sensePcMeta } from "@/app/seo/metadata";
import { sensePcJsonLd } from "@/app/seo/schema/sensepc";

export const metadata: Metadata = {
  title: sensePcMeta.title,
  description: sensePcMeta.description,
  keywords: sensePcMeta.keywords,
  alternates: {
    canonical: "/products/sensepc",
  },
  openGraph: {
    title: sensePcMeta.title,
    description: sensePcMeta.description,
    url: "/products/sensepc",
    type: "website",
    images: ["/sensepc-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: sensePcMeta.title,
    description: sensePcMeta.description,
    images: ["/sensepc-logo.png"],
  },
};

export default function SensePcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sensePcJsonLd) }}
      />
      {children}
    </>
  );
}
