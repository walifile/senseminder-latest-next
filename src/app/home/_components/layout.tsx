"use client";

import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-[#000624]">
      <div className="absolute inset-0 bg-[url('/assets/images/noise.png')] opacity-[0.011] pointer-events-none" />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
