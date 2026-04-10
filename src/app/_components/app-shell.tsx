"use client";

import AuthGuard from "@/guards/auth-guard";
import { usePathname } from "next/navigation";
import { ReduxProvider } from "@/redux/provider";
import { AmplifyProvider } from "@/providers/AmplifyProvider";
import { WebSocketProvider } from "@/providers/WebSocketProvider";

import { ThemeWrapper } from "@/components/shared/layout/theme-wrapper";
import {
  ChromeShell,
  PublicShell,
  FullscreenShell,
} from "@/components/shared/layout/shells";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome =
    pathname.startsWith("/pc-viewer") || pathname.startsWith("/welcome");

  const isAuth = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  const showPublicLayout = !hideChrome && !isAuth && !isDashboard;

  const shellClass = hideChrome
    ? "h-full overflow-hidden"
    : "min-h-screen";

  return (
    <div className={shellClass}>
      <ReduxProvider>
        <AmplifyProvider>
          <WebSocketProvider>
            <ThemeWrapper>
              <AuthGuard>
                {hideChrome ? (
                  <FullscreenShell>{children}</FullscreenShell>
                ) : showPublicLayout ? (
                  <PublicShell>{children}</PublicShell>
                ) : (
                  <ChromeShell centerContent={isAuth}>{children}</ChromeShell>
                )}
              </AuthGuard>
            </ThemeWrapper>
          </WebSocketProvider>
        </AmplifyProvider>
      </ReduxProvider>
    </div>
  );
}
