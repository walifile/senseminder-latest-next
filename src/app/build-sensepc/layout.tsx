import type { Metadata } from "next";

import { buildSensePcMeta } from "@/app/seo/metadata";
import { buildSensePcJsonLd } from "@/app/seo/schema/build-sensepc";

export const metadata: Metadata = {
  title: buildSensePcMeta.title,
  description: buildSensePcMeta.description,
};

export default function BuildSensePcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSensePcJsonLd) }}
      />
      {children}
    </>
  );
}
