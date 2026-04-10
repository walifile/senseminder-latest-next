"use client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full dark:bg-[#000624]">
      <main className="flex min-h-screen items-center justify-center">
        {/* This container clamps width so it doesn't look 'zoomed' on wide screens */}
        <div className="w-full max-w-[1320px] px-4 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
