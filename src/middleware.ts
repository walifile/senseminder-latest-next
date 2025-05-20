/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRoutes, routes } from "./constants/routes";

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
    try {
      const authState = JSON.parse(authStateCookie.value);
      hasAuthState = authState.isAuthenticated && authState.token;
    } catch (e) {
      console.error("Invalid auth state cookie");
      // If there's an error parsing the cookie, force a redirect to login
      const loginUrl = new URL(routes?.signIn, request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const isAuthenticated = hasCognitoToken && hasAuthState;

  const isPublicRoute = publicRoutes.includes(pathname);

  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL(routes?.signIn, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
