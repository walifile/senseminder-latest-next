"use client";

import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen grid-bg">
      <main>{children}</main>
    </div>
  );
}
