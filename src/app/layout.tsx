import Navbar from "@/components/shared/layout/navbar";
import "../styles/globals.css";
import { metadata } from "./metadata";
import { ThemeWrapper } from "@/components/shared/layout/theme-wrapper";
import Footer from "@/components/shared/layout/footer";
import { ReduxProvider } from "@/redux/provider";
import { AmplifyProvider } from "@/providers/AmplifyProvider";
import { WebSocketProvider } from "@/providers/WebSocketProvider";

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
              <div className="flex min-h-screen flex-col overflow-x-hidden">
                <Navbar />
                {children}
                <Footer />
              </div>
            </ThemeWrapper>
           </WebSocketProvider>
           
          </AmplifyProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
