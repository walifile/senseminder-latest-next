import "../styles/globals.css";

import type { ReactNode } from "react";

import { appMetadata } from "@/app/seo/metadata";
import AppShell from "@/app/_components/app-shell";
import { Inter, Poppins, Space_Grotesk } from "next/font/google";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${poppins.variable}  overflow-x-hidden md:overflow-x-visible`}
    >
      <body suppressHydrationWarning className="font-inter">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
