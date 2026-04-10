import type { Metadata } from "next";

import { faqMeta } from "@/app/seo/metadata";
import { faqJsonLd } from "@/app/seo/schema/faq";
import MainPage from "@/app/faq/_components/main-page";

export const metadata: Metadata = {
  title: faqMeta.title,
  description: faqMeta.description,
  keywords: faqMeta.keywords,
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: faqMeta.title,
    description: faqMeta.description,
    url: "/faq",
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "SensePC FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: faqMeta.title,
    description: faqMeta.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: "SensePC FAQ",
      },
    ],
  },
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MainPage />
    </>
  );
}
