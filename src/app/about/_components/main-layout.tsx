import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 opacity-[0.011] md:bg-[url('/assets/images/noise.png')]" />
      <main className="relative z-10">{children}</main>
    </div>
  );
}

