import type { Metadata } from "next";

import { aboutMeta } from "@/app/seo/metadata";
import { aboutJsonLd } from "@/app/seo/schema/about";

import AboutPage from "./_components/main-page";

export const metadata: Metadata = {
  title: aboutMeta.title,
  description: aboutMeta.description,
  keywords: aboutMeta.keywords,
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
