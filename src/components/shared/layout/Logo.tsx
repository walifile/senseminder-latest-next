// components/shared/layout/Logo.tsx

"use client";

import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

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
  const LogoImage = (
    <div
      className={cn(
        "relative",
        sign
          ? "md:w-[40px] md:h-[40px]"
          : "w-[55px] h-[40px] md:w-[82px] md:h-[60px]"
      )}
    >
      {sign === true ? (
        <Image
          src="/favicon/apple-touch-icon.png"
          alt="Sense PC Logo"
          fill
          priority
          className="object-contain"
          sizes="(max-width: 768px) 55px, 82px"
        />
      ) : (
        <>
          <Image
            src="/sensepc-logo-light-1.png"
            alt="Sense PC Logo"
            fill
            priority
            className="object-contain dark:hidden"
            sizes="(max-width: 768px) 55px, 82px"
          />
          <Image
            src="/assets/authlayout/dark/sensepc-logo-dark-white-mark.png"
            alt="Sense PC Logo"
            fill
            priority
            className="hidden object-contain dark:block"
            sizes="(max-width: 768px) 55px, 82px"
          />
        </>
      )}
    </div>
  );

  if (noLink) return <span className="flex items-center space-x-2">{LogoImage}</span>;

  return (
    <Link href={href} className="flex items-center space-x-2">
      {LogoImage}
    </Link>
  );
}
