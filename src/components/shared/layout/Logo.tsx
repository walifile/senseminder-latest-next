// components/shared/layout/Logo.tsx

"use client";

import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

import { useTheme } from "./theme-provider";

type LogoProps = {
  sign?: boolean;
  /**
   * Prevents rendering a nested <Link>. Use when the parent already wraps <Logo /> in <Link>.
   */
  noLink?: boolean;
  /**
   * Optional override if you ever want a different destination.
   */
  href?: string;
};

export function Logo({ sign, noLink = false, href = "/" }: LogoProps) {
  const { resolvedTheme } = useTheme();

  const logoSrc =
    sign === true
      ? "/favicon/apple-touch-icon.png"
      : resolvedTheme === "dark"
        ? "/sensepc-logo-dark.png"
        : "/sensepc-logo-light.png";

  const LogoImage = (
    <div
      className={cn(
        "relative",
        sign
          ? "md:w-[40px] md:h-[40px]"
          : "w-[55px] h-[40px] md:w-[82px] md:h-[60px]"
      )}
    >
      <Image
        src={logoSrc}
        alt="Sense PC Logo"
        fill
        priority
        sizes="(max-width: 768px) 55px, 82px"
      />
    </div>
  );

  if (noLink) return <span className="flex items-center space-x-2">{LogoImage}</span>;

  return (
    <Link href={href} className="flex items-center space-x-2">
      {LogoImage}
    </Link>
  );
}
