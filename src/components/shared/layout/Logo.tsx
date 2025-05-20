import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] bg-clip-text text-transparent hover:from-[#0284C7] hover:to-[#4F46E5] transition-all duration-300">
        SmartPC
      </span>
    </Link>
  );
}
