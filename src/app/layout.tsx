"use client";

import "../styles/globals.css";

import AuthGuard from "@/guards/auth-guard";
import { usePathname } from "next/navigation";
import { ReduxProvider } from "@/redux/provider";
import { isDev } from "@/constants/initial-values";
import { AmplifyProvider } from "@/providers/AmplifyProvider";
import { WebSocketProvider } from "@/providers/WebSocketProvider";

import Navbar from "@/components/shared/layout/navbar";
import Footer from "@/components/shared/layout/footer";
import { ThemeWrapper } from "@/components/shared/layout/theme-wrapper";

// import { metadata } from "./metadata";

// export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // test

  if (pathname === "/" && !isDev) {
    return (
      <html lang="en">
        <head>
          <title>SmartPC</title>
          <meta name="description" content="SmartPC Application" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body suppressHydrationWarning className="overflow-hidden">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>SmartPC</title>
        <meta name="description" content="SmartPC Application" />
        <link rel="icon" href="/favicon.ico" />
      </head>
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
