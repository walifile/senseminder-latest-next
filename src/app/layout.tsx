import "../styles/globals.css";

import type { ReactNode } from "react";

import { headers } from "next/headers";
import { appMetadata } from "@/app/seo/metadata";
import { Inter, Poppins, Space_Grotesk } from "next/font/google";

import RootShell from "@/components/shared/layout/root-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata = appMetadata;

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") || "";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${poppins.variable}  overflow-x-hidden md:overflow-x-visible`}
    >
      <body suppressHydrationWarning className="font-inter">
        <RootShell initialPathname={pathname}>{children}</RootShell>
      </body>
    </html>
  );
}
