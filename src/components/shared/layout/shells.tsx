"use client";

import type { ReactNode } from "react";

import Footer from "@/components/shared/layout/footer";
import Navbar from "@/components/shared/layout/navbar";
import AnnouncementBar from "@/components/shared/announcement/announcement-bar";

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
      <AnnouncementBar />
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
  return <ChromeShell centerContent={false}>{children}</ChromeShell>;
}
