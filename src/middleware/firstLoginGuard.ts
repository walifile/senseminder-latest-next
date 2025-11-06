
import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import appConfig from "@/config/app-config";
import { Logger } from "@/lib/utils/logger";


const { USER_POOL_CLIENT_ID } = appConfig;

export async function firstLoginGuard(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const allowlist = ["/welcome", "/terms", "/privacy"];

  // Skip guard for public pages
  if (allowlist.includes(path)) {
    // Logger.log(`[firstLoginGuard] Skipping guard for public page: ${path}`);
    return null;
  }

  try {
    const cookies = request.cookies.getAll();

    // Find the correct Cognito idToken cookie for our App Client ID
    const idTokenCookie = cookies.find(
      (c) =>
        c.name.includes(`CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}`) &&
        c.name.endsWith(".idToken")
    );

    if (!idTokenCookie?.value) {
      // Logger.log("[firstLoginGuard] No valid idToken cookie found → allow request.");
      return null;
    }

    // Decode JWT payload
    const parts = idTokenCookie.value.split(".");
    if (parts.length !== 3) {
      // Logger.warn("[firstLoginGuard] Invalid JWT structure → allow request.");
      return null;
    }

    const [, payloadBase64] = parts;
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf8")
    );

    const onboarded = decodedPayload["custom:onboarded"];
    // Logger.log(
    //   "[firstLoginGuard] Decoded onboarded value:",
    //   onboarded,
    //   "type:",
    //   typeof onboarded
    // );

    // Normalize and evaluate all possible "false" cases
    const normalized = String(onboarded ?? "").trim().toLowerCase();
    const isNotOnboarded =
      normalized === "false" || normalized === "0" || onboarded === false;

    if (isNotOnboarded) {
      const welcomeUrl = new URL("/welcome", request.url);
      // Logger.log("[firstLoginGuard] User not onboarded → redirecting to /welcome");
      return NextResponse.redirect(welcomeUrl);
    }

    // Logger.log("[firstLoginGuard] ⏭ Onboarding complete → allow request.");
    return null;
  } catch (err) {
    Logger.error("[firstLoginGuard] ERROR:", err);
    return null;
  }
}
