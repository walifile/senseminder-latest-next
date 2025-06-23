import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <span
        className="text-gradient-clip font-bold text-2xl tracking-tight text-transparent transition-all duration-300 hover:from-[#0284C7] hover:to-[#4F46E5]"
        style={{
          backgroundImage: "linear-gradient(to right, #0284C7,#4F46E5)",
        }}
      >
        SmartPC
      </span>
    </Link>
  );
}
