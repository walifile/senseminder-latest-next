import type { Metadata } from "next";

import { sensePcMeta } from "@/app/seo/metadata";
import { sensePcJsonLd } from "@/app/seo/schema/sensepc";

export const metadata: Metadata = {
  title: sensePcMeta.title,
  description: sensePcMeta.description,
};

export default function SensePcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sensePcJsonLd) }}
      />
      {children}
    </>
  );
}
