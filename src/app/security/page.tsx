import type { Metadata } from "next";

import { securityMeta } from "@/app/seo/metadata";
import { securityJsonLd } from "@/app/seo/schema/security";

import MainPage from "./_components/main-page";

export const metadata: Metadata = {
  title: securityMeta.title,
  description: securityMeta.description,
  keywords: securityMeta.keywords,
  alternates: {
    canonical: "/security",
  },
  openGraph: {
    title: securityMeta.title,
    description: securityMeta.description,
    url: "/security",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC Security and Trust",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: securityMeta.title,
    description: securityMeta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC Security and Trust",
      },
    ],
  },
};

export default function SecurityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(securityJsonLd) }}
      />
      <MainPage />
    </>
  );
}
