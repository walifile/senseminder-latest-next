// components/shared/layout/Logo.tsx
import Link from "next/link";
import Image from "next/image";

import { useTheme } from "./theme-provider";

export function Logo() {
  const { resolvedTheme } = useTheme();

  const logoSrc =
    resolvedTheme === "dark"
      ? "/sensepc-logo-dark.png"
      : "/sensepc-logo-light.png";

  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="relative w-[55px] h-[40px] md:w-[82px] md:h-[60px]">
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
