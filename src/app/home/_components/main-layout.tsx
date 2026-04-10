import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className=" min-h-screen relative bg-[linear-gradient(180deg,_#F4F1FF_0%,_#FFFFFF_100%)] dark:bg-none">
      {/* <div className="absolute inset-0 bg-[url('/assets/images/noise.png')] opacity-[0.011] pointer-events-none" /> */}
      <main className="relative z-10">{children}</main>
    </div>
  );
}
