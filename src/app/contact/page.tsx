import type { Metadata } from "next";

import { contactMeta } from "@/app/seo/metadata";
import { contactJsonLd } from "@/app/seo/schema/contact";

import MainPage from "./_components/main-page";

export const metadata: Metadata = {
  title: contactMeta.title,
  description: contactMeta.description,
  keywords: contactMeta.keywords,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: contactMeta.title,
    description: contactMeta.description,
    url: "/contact",
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
    title: contactMeta.title,
    description: contactMeta.description,
    images: ["/sensepc-logo-dark.png"],
  },
};

const Contact = () => (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
    />
    <MainPage />
  </>
);

export default Contact;
