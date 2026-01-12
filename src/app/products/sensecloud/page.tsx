import type { Metadata } from "next";

import { senseCloudMeta } from "@/app/seo/metadata";

import SenseCloudPage from "./_components/main-page";

export const metadata: Metadata = {
  title: senseCloudMeta.title,
  description: senseCloudMeta.description,
  keywords: senseCloudMeta.keywords,
};

export default function SenseCloud() {
  return <SenseCloudPage />;
}
