import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export async function firstLoginGuard(request: NextRequest) {

  const path = request.nextUrl.pathname;
  const allowlist = ["/welcome", "/terms", "/privacy"];
  if (allowlist.includes(path)) {
    console.log(`Skipping guard for public page: ${path}`);
    return null;
  }

  try {
    const cookies = request.cookies.getAll();
    const idTokenCookie = cookies.find(
      (c) =>
        c.name.includes("CognitoIdentityServiceProvider") &&
        c.name.includes("idToken")
    );

    if (!idTokenCookie?.value) {
      return null;
    }
    const [, payloadBase64] = idTokenCookie.value.split(".");
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf8")
    );

    const onboarded = decodedPayload["custom:onboarded"];
    if (onboarded === "false") {
      const welcomeUrl = new URL("/welcome", request.url);
      return NextResponse.redirect(welcomeUrl);
    }
    console.log("⏭ Onboarding complete → allow request.");
    return null;
  } catch (err) {
    console.error("ERROR in firstLoginGuard:", err);
    return null;
  }
}
