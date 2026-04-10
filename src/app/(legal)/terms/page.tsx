import type { Metadata } from "next";

import { termsMeta } from "@/app/seo/metadata";
import { termsJsonLd } from "@/app/seo/schema/terms";

import TermsMainPage from "./_components/main-page";

export const metadata: Metadata = {
  title: termsMeta.title,
  description: termsMeta.description,
  keywords: termsMeta.keywords,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: termsMeta.title,
    description: termsMeta.description,
    url: "/terms",
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
    title: termsMeta.title,
    description: termsMeta.description,
    images: ["/sensepc-logo-dark.png"],
  },
};

const TermsPage = () => (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
    />
    <TermsMainPage />
  </>
);

export default TermsPage;
