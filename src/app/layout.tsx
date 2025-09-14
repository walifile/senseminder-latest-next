import "../styles/globals.css";

import AuthGuard from "@/guards/auth-guard";
import { ReduxProvider } from "@/redux/provider";
import { AmplifyProvider } from "@/providers/AmplifyProvider";
import { WebSocketProvider } from "@/providers/WebSocketProvider";

import Navbar from "@/components/shared/layout/navbar";
import Footer from "@/components/shared/layout/footer";
import { ThemeWrapper } from "@/components/shared/layout/theme-wrapper";

import { metadata } from "./metadata";

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ReduxProvider>
          <AmplifyProvider>
            <WebSocketProvider>
              <ThemeWrapper>
                <AuthGuard>
                  <div className="flex min-h-screen flex-col overflow-x-hidden">
                    <Navbar />
                    {children}
                    <Footer />
                  </div>
                </AuthGuard>
              </ThemeWrapper>
            </WebSocketProvider>
          </AmplifyProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
