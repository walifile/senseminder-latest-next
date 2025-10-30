"use client";

import "../styles/globals.css";

import AuthGuard from "@/guards/auth-guard";
import { usePathname } from "next/navigation";
import { ReduxProvider } from "@/redux/provider";
import { isDev } from "@/constants/initial-values";
import { AmplifyProvider } from "@/providers/AmplifyProvider";
import { Inter, Poppins, Space_Grotesk } from "next/font/google";
import { WebSocketProvider } from "@/providers/WebSocketProvider";

import Navbar from "@/components/shared/layout/navbar";
import Footer from "@/components/shared/layout/footer";
import { ThemeWrapper } from "@/components/shared/layout/theme-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Special case: root landing page in prod
  if (pathname === "/" && !isDev) {
    return (
      <html
        lang="en"
        className={`${inter.variable} ${spaceGrotesk.variable} ${poppins.variable}`}
      >
        <head>
          <title>SensePC</title>
          <meta name="description" content="SensePC Application" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body suppressHydrationWarning className="font-inter overflow-hidden">
          {children}
        </body>
      </html>
    );
  }

  // Routes that should be true fullscreen (no chrome, no page scroll)
  const isLandingProd = pathname === "/" && !isDev;
  const hideChrome =
    pathname.startsWith("/pc-viewer") ||
    pathname.startsWith("/welcome") ||
    isLandingProd;

  // Body classes — lock only on the pages that need it
  const bodyClass = hideChrome
    ? "h-full overflow-hidden" // viewer/welcome/landing in prod
    : "min-h-screen overflow-x-hidden"; // normal app pages (scroll allowed)

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${poppins.variable}`}
    >
      <head>
        <title>SensePC</title>
        <meta name="description" content="SensePC Application" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning className={`font-inter ${bodyClass}`}>
        <ReduxProvider>
          <AmplifyProvider>
            <WebSocketProvider>
              <ThemeWrapper>
                <AuthGuard>
                  {/* <div className="min-h-screen">{children}</div> */}

                  {hideChrome ? (
                    <div className="h-full">{children}</div>
                  ) : (
                    <div className="flex min-h-screen flex-col">
                      {/* <div className="flex min-h-screen flex-col overflow-x-hidden"> */}
                      <Navbar />
                      {/* <main className="flex-1 min-h-0"> */}
                      {children}
                      {/* </main> */}
                      <Footer />
                    </div>
                  )}
                </AuthGuard>
              </ThemeWrapper>
            </WebSocketProvider>
          </AmplifyProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

// import "../styles/globals.css";

// import { headers } from "next/headers";
// import AuthGuard from "@/guards/auth-guard";
// import { ReduxProvider } from "@/redux/provider";
// import { AmplifyProvider } from "@/providers/AmplifyProvider";
// import { WebSocketProvider } from "@/providers/WebSocketProvider";

// import Footer from "@/components/shared/layout/footer";
// import Navbar from "@/components/shared/layout/navbar";
// import { ThemeWrapper } from "@/components/shared/layout/theme-wrapper";

// import { metadata } from "./metadata";

// export { metadata };

// export default async function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const headerList = await headers();
//   const pathname = headerList.get("x-current-path");
//   const p = pathname ? "ues " : "jno";

//   console.log({ pathname, p });

//   if (!pathname) {
//     return (
//       <html lang="en">
//         <body suppressHydrationWarning className="overflow-hidden">
//           {children}
//         </body>
//       </html>
//     );
//   }

//   return (
//     <html lang="en">
//       <body suppressHydrationWarning>
//         <ReduxProvider>
//           <AmplifyProvider>
//             <WebSocketProvider>
//               <ThemeWrapper>
//                 <AuthGuard>
//                   <div className="flex min-h-screen flex-col overflow-x-hidden">
//                     <Navbar />
//                     {children}
//                     <Footer />
//                   </div>
//                 </AuthGuard>
//               </ThemeWrapper>
//             </WebSocketProvider>
//           </AmplifyProvider>
//         </ReduxProvider>
//       </body>
//     </html>
//   );
// }
