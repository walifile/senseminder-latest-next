"use client";

import AuthGuard from "@/guards/auth-guard";
import { usePathname } from "next/navigation";
import { ReduxProvider } from "@/redux/provider";
import { homeMeta, defaultMeta } from "@/app/seo/metadata";
import { AmplifyProvider } from "@/providers/AmplifyProvider";
import { Inter, Poppins, Space_Grotesk } from "next/font/google";
import { WebSocketProvider } from "@/providers/WebSocketProvider";

import Navbar from "@/components/shared/layout/navbar";
import Footer from "@/components/shared/layout/footer";
import { ThemeWrapper } from "@/components/shared/layout/theme-wrapper";
import PublicDarkBackground from "@/components/shared/layout/public-pages/dark-bg";
import PublicLightBackground from "@/components/shared/layout/public-pages/light-bg";

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
  const isHome = pathname === "/" || pathname === "/home";
  const pageTitle = isHome ? homeMeta.title : defaultMeta.title;
  const pageDescription = isHome
    ? homeMeta.description
    : defaultMeta.description;
  const pageKeywords = isHome ? homeMeta.keywords.join(", ") : undefined;

  // Special case: root landing page in prod
  // if (pathname === "/" && !isDev) {
  //   return (
  //     <html
  //       lang="en"
  //       className={`${inter.variable} ${spaceGrotesk.variable} ${poppins.variable} dark overflow-x-hidden md:overflow-x-visible`}
  //     >
  //       <head>
  //         <title>SensePC</title>
  //         <meta name="description" content="SensePC Application" />

  //         <link
  //           rel="apple-touch-icon"
  //           sizes="180x180"
  //           href="/favicon/apple-touch-icon.png"
  //         />
  //         <link
  //           rel="icon"
  //           type="image/png"
  //           sizes="32x32"
  //           href="/favicon/favicon-32x32.png"
  //         />
  //         <link
  //           rel="icon"
  //           type="image/png"
  //           sizes="16x16"
  //           href="/favicon/favicon-16x16.png"
  //         />
  //         <link rel="manifest" href="/favicon/site.webmanifest" />
  //         <link rel="shortcut icon" href="/favicon/favicon.ico" />
  //       </head>
  //       <body suppressHydrationWarning className="font-inter overflow-hidden">
  //         {children}
  //       </body>
  //     </html>
  //   );
  // }

  // Routes that should be true fullscreen (no chrome, no page scroll)
  // const isLandingProd = pathname === "/" && !isDev;
  const hideChrome =
    pathname.startsWith("/pc-viewer") || pathname.startsWith("/welcome");
  // ||
  // isLandingProd;

  const isAuth = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");

  // Body classes — lock only on the pages that need it
  const bodyClass = hideChrome
    ? "h-full overflow-hidden" // viewer/welcome/landing in prod
    : "min-h-screen overflow-x-hidden"; // normal app pages (scroll allowed)

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${poppins.variable}  overflow-x-hidden md:overflow-x-visible`}
    >
      <head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {pageKeywords ? <meta name="keywords" content={pageKeywords} /> : null}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
      </head>
      <body suppressHydrationWarning className={`font-inter ${bodyClass}`}>
        <ReduxProvider>
          <AmplifyProvider>
            <WebSocketProvider>
              <ThemeWrapper>
                <AuthGuard>
                  {hideChrome ? (
                    // 🔹 Fullscreen pages (pc-viewer, welcome, landing in prod)
                    <div className="h-full">{children}</div>
                  ) : isAuth || isDashboard ? (
                    <div className="flex min-h-screen flex-col">
                      <Navbar />
                      <main
                        className={`flex-1 flex flex-col ${
                          isAuth ? "justify-center" : ""
                        }`}
                      >
                        {children}
                      </main>
                      <Footer />
                    </div>
                  ) : (
                    // 🔹 All other normal pages: apply public light/dark bg
                    <div className="relative min-h-screen w-full overflow-hidden">
                      {/* Background layer */}
                      <div className="pointer-events-none absolute inset-0 z-0">
                        <div className="block dark:hidden">
                          <PublicLightBackground />
                        </div>
                        <div className="hidden dark:block">
                          <PublicDarkBackground />
                        </div>
                      </div>

                      {/* Content layer */}
                      <div className="relative z-30 flex min-h-screen flex-col">
                        <Navbar />
                        <main className="flex-1 flex flex-col">{children}</main>
                        <Footer />
                      </div>
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
