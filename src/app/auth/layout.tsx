
"use client";

import AuthDarkBackground from "@/components/shared/layout/public-pages/dark-bg";
import AuthLightBackground from "@/components/shared/layout/public-pages/light-bg";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background layer */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="block dark:hidden">
          <AuthLightBackground />
        </div>

        <div className="hidden dark:block">
          <AuthDarkBackground />
        </div>
      </div>

      {/* Content layer */}
      <main className="relative z-30 flex min-h-screen items-center justify-center">
        {/* This container clamps width so it doesn't look 'zoomed' on wide screens */}
        <div className="w-full max-w-[1320px] px-4 md:px-8">
          {children}
        </div>
      </main>

  
    </div>
  );
}
