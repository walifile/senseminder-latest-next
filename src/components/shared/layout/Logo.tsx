// components/shared/layout/Logo.tsx
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

import { useTheme } from "./theme-provider";

export function Logo( { sign }: { sign?: boolean } ) {
  const { resolvedTheme } = useTheme();

  const logoSrc =
  sign == true ? ("/favicon/apple-touch-icon.png") : (
    resolvedTheme === "dark"
      ? "/sensepc-logo-dark.png"
      : "/sensepc-logo-light.png"
  );

  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className={cn("relative",
        sign ? "md:w-[40px] md:h-[40px]" : "w-[55px] h-[40px] md:w-[82px] md:h-[60px]"
      )}>
        <Image
          src={logoSrc}
          alt="Sense PC Logo"
          fill
          priority
          sizes="(max-width: 768px) 55px, 82px"
        />
      </div>
    </Link>
  );
}
