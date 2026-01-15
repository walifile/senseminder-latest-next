"use client";

import type { ReactNode } from "react";

import Footer from "@/components/shared/layout/footer";
import Navbar from "@/components/shared/layout/navbar";

import PublicDarkBackground from "@/components/shared/layout/public-pages/dark-bg";
import PublicLightBackground from "@/components/shared/layout/public-pages/light-bg";

export type ShellProps = { children: ReactNode };

export function FullscreenShell({ children }: ShellProps) {
  return <div className="h-full">{children}</div>;
}

export function ChromeShell({
  children,
  centerContent,
}: ShellProps & { centerContent?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main
        className={`flex-1 flex flex-col ${
          centerContent ? "justify-center" : ""
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function PublicShell({ children }: ShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="block dark:hidden">
          <PublicLightBackground />
        </div>
        <div className="hidden dark:block">
          <PublicDarkBackground />
        </div>
      </div>

      <div className="relative z-30">
        <ChromeShell centerContent={false}>{children}</ChromeShell>
      </div>
    </div>
  );
}
