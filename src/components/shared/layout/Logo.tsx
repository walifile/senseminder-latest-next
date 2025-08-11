// components/shared/layout/Logo.tsx
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <span
        className="text-gradient-clip font-bold text-2xl tracking-tight text-transparent"
        style={{
          backgroundImage: "linear-gradient(to right, #38BDF8, #6366F1)",
          fontFamily: "'Unica One', sans-serif",
        }}
      >
        Sense PC
      </span>
    </Link>
  );
}
