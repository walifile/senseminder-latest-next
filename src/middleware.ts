import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { routes, publicRoutes } from "./constants/routes";
import { passwordProtectionMiddleware } from "./middleware/password-protection";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.cookies.getAll();

  // Check for Cognito tokens
  const hasCognitoToken = cookies.some(
    (cookie: { name: string }) =>
      cookie.name.includes("CognitoIdentityServiceProvider") &&
      (cookie.name.includes("accessTokenky") || cookie.name.includes("idToken"))
  );

  // Check for our synced auth state
  const authStateCookie = cookies.find(
    (cookie) => cookie.name === "auth.state"
  );
  let hasAuthState = false;
  if (authStateCookie) {
    let authState = null;

    try {
      authState = JSON.parse(authStateCookie.value);
    } catch {
      console.warn("Invalid JSON in auth.state cookie:", authStateCookie.value);
    }

    hasAuthState = authState?.isAuthenticated && authState?.token;
  }

  const isAuthenticated = hasCognitoToken && hasAuthState;

  const isPublicRoute = publicRoutes.includes(pathname);
  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL(routes?.signIn, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const passwordProtectionResponse = passwordProtectionMiddleware(request);
  if (passwordProtectionResponse) {
    return passwordProtectionResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
