"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/app/_components/app-shell";
import { shouldUsePublicSeoShell } from "@/constants/routes";

import PublicSeoShell from "@/components/shared/layout/public-seo-shell";

export default function RootShell({
  children,
  initialPathname,
}: {
  children: React.ReactNode;
  initialPathname: string;
}) {
  const pathname = usePathname() || initialPathname;

  if (shouldUsePublicSeoShell(pathname)) {
    return <PublicSeoShell>{children}</PublicSeoShell>;
  }

  return <AppShell>{children}</AppShell>;
}
