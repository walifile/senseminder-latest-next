import { ReactNode } from "react";
import AuthFooter from "@/app/auth/_components/auth-footer";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0A0A1B]">
      <main className="flex-1 flex items-center justify-center px-4 pb-16 pt-20">
        <div className="w-full max-w-[480px]">
          <div className="rounded-[20px] border border-gray-100 bg-white/80 p-8 shadow-xl backdrop-blur-[32px] dark:border-[#ffffff0f] dark:bg-[#0A0A1B]/40 dark:shadow-2xl">
            {children}
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
