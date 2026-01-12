import type { Metadata } from "next";

import { homeMeta } from "@/app/seo/metadata";

import HomePage from "./_components/main-page";

export const metadata: Metadata = {
  title: homeMeta.title,
  description: homeMeta.description,
  keywords: homeMeta.keywords,
};

export default function Home() {
  return <HomePage />;
}
