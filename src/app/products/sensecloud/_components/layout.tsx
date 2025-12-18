


"use client";

import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-[#000624]">
      {/* LEFT glow */}
      {/* Light */}
      <div className="pointer-events-none absolute top-0 left-0 z-0 dark:hidden">
        <img
          src="/assets/product/Ellipse 6-light.svg"
          alt=""
          className="block h-auto w-auto max-w-none select-none"
        />
      </div>
      {/* Dark */}
      <div className="pointer-events-none absolute top-0 left-0 z-0 hidden dark:block">
        <img
          src="/assets/product/Ellipse 6.svg"
          alt=""
          className="block h-auto w-auto max-w-none select-none"
        />
      </div>

      {/* RIGHT glow */}
      {/* Light */}
      <div className="pointer-events-none absolute top-0 right-0 z-0 dark:hidden">
        <img
          src="/assets/product/Ellipse 1-light.svg"
          alt=""
          className="block h-auto w-auto max-w-none select-none"
        />
      </div>
      {/* Dark */}
      <div className="pointer-events-none absolute top-0 right-0 z-0 hidden dark:block">
        <img
          src="/assets/product/Ellipse 1.svg"
          alt=""
          className="block h-auto w-auto max-w-none select-none"
        />
      </div>

      {/* Content */}
      <main className="relative z-10">{children}</main>
    </div>
  );
}
