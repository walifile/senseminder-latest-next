import type { Metadata } from "next";

import { tutorialsMeta } from "@/app/seo/metadata";
import { tutorialsJsonLd } from "@/app/seo/schema/tutorials";

import MainPage from "./_components/main-page";

type SearchParamValue = string | string[] | undefined;

type TutorialsSearchParams = {
  q?: SearchParamValue;
  category?: SearchParamValue;
  difficulty?: SearchParamValue;
};

type TutorialsPageProps = {
  searchParams?: Promise<TutorialsSearchParams>;
};

export const metadata: Metadata = {
  title: tutorialsMeta.title,
  description: tutorialsMeta.description,
  keywords: tutorialsMeta.keywords,
  alternates: {
    canonical: "/tutorials",
  },
  openGraph: {
    title: tutorialsMeta.title,
    description: tutorialsMeta.description,
    url: "/tutorials",
    type: "website",
    images: ["/sensepc-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: tutorialsMeta.title,
    description: tutorialsMeta.description,
    images: ["/sensepc-logo.png"],
  },
};

const TutorialsPage = async ({ searchParams }: TutorialsPageProps) => {
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tutorialsJsonLd) }}
      />
      <MainPage searchParams={resolvedSearchParams} />
    </>
  );
};

export default TutorialsPage;
