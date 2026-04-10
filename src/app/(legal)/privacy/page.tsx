import type { Metadata } from "next";

import { privacyMeta } from "@/app/seo/metadata";
import { privacyJsonLd } from "@/app/seo/schema/privacy";

import PrivacyMainPage from "./_components/main-page";

export const metadata: Metadata = {
  title: privacyMeta.title,
  description: privacyMeta.description,
  keywords: privacyMeta.keywords,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: privacyMeta.title,
    description: privacyMeta.description,
    url: "/privacy",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: privacyMeta.title,
    description: privacyMeta.description,
    images: ["/sensepc-logo-dark.png"],
  },
};

const PrivacyPage = () => (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
    />
    <PrivacyMainPage />
  </>
);

export default PrivacyPage;
