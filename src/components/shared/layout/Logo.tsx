// components/shared/layout/Logo.tsx
import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/sensepc-logo.png"
        alt="Sense PC Logo"
        width={112} // w-28 = 112px
        height={32} // h-8 = 32px
        priority
      />
    </Link>
  );
}
