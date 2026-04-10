import type { Metadata } from "next";

import { aboutMeta } from "@/app/seo/metadata";
import { aboutJsonLd } from "@/app/seo/schema/about";

import AboutPage from "./_components/main-page";

export const metadata: Metadata = {
  title: aboutMeta.title,
  description: aboutMeta.description,
  keywords: aboutMeta.keywords,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: aboutMeta.title,
    description: aboutMeta.description,
    url: "/about",
    type: "website",
    images: ["/sensepc-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: aboutMeta.title,
    description: aboutMeta.description,
    images: ["/sensepc-logo.png"],
  },
};

export default function About() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <AboutPage />
    </>
  );
}
