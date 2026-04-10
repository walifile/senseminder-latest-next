import type { Metadata } from "next";

import { buildUseCaseJsonLd } from "@/app/seo/schema/use-cases";
import UseCasePage from "@/app/use-cases/_components/use-case-page";
import { getUseCaseContent } from "@/app/use-cases/_data/use-cases-content";

const content = getUseCaseContent("gaming");

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
  keywords: content.keywords,
  alternates: {
    canonical: content.canonicalPath,
  },
  openGraph: {
    title: content.title,
    description: content.description,
    url: content.canonicalPath,
    type: "website",
    images: [
      {
        url: "/sensepc-logo-dark.png",
        width: 1200,
        height: 630,
        alt: `${content.label} cloud desktops`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: content.title,
    description: content.description,
    images: [
      {
        url: "/sensepc-logo-dark.png",
        alt: `${content.label} cloud desktops`,
      },
    ],
  },
};

export default function GamingUseCasePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildUseCaseJsonLd("gaming")),
        }}
      />
      <UseCasePage slug="gaming" />
    </>
  );
}
