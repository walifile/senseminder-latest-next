import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
// import { isDev } from "@/constants/initial-values";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function passwordProtectionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return null;
  }

  // if (isDev) {
  //   if (pathname === "/auth/password-required") {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  //   return null;
  // }

  const passwordCookie = request.cookies.get("passwordHash");
  const staticPassword = "Sense@123";
  const expectedHash = await hashPassword(staticPassword);

  if (
    pathname === "/auth/password-required" &&
    passwordCookie?.value === expectedHash
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/" || pathname === "/auth/password-required") {
    return null;
  }

  if (!passwordCookie || passwordCookie.value !== expectedHash) {
    const passwordUrl = new URL("/auth/password-required", request.url);
    passwordUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(passwordUrl);
  }

  return null;
}
