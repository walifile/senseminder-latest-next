import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <span
        className="font-bold text-2xl tracking-tight text-transparent transition-all duration-300 hover:from-[#0284C7] hover:to-[#4F46E5]"
        style={{
          backgroundImage: "linear-gradient(to right, #0284C7,#4F46E5)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        SmartPC
      </span>
    </Link>
  );
}
