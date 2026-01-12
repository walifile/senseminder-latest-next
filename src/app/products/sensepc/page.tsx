import type { Metadata } from "next";

import { sensePcMeta } from "@/app/seo/metadata";

import SensePCPage from "./_components/main-page";

export const metadata: Metadata = {
  title: sensePcMeta.title,
  description: sensePcMeta.description,
  keywords: sensePcMeta.keywords,
};

export default function SensePC() {
  return <SensePCPage />;
}
