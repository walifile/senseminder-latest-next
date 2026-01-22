import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import appConfig from "@/config/app-config";

const resolvePingConfig = () => {
  const pingUrl =
    appConfig.PING_API_URL || process.env.NEXT_PUBLIC_PING_API_URL;
  const pingKey =
    appConfig.PING_API_KEY || process.env.NEXT_PUBLIC_PING_API_KEY;

  return { pingUrl, pingKey };
};

export async function GET(request: NextRequest) {
  const { pingUrl, pingKey } = resolvePingConfig();
  if (!pingUrl || !pingKey) {
    return NextResponse.json(
      {
        error: "PING configuration missing",
        details: { pingUrl: Boolean(pingUrl), pingKey: Boolean(pingKey) },
      },
      { status: 500 }
    );
  }
  const REGION_TO_URL: Record<string, string> = {
    default: pingUrl,
    storage: pingUrl,
  };

  const searchParams = request.nextUrl.searchParams;
  const target = searchParams.get("target") ?? "default";
  const upstreamUrl = REGION_TO_URL[target];

  if (!upstreamUrl) {
    return NextResponse.json(
      {
        error: "Unknown ping target",
        upstreamUrl,
        REGION_TO_URL,
        target,
        searchParams,
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(upstreamUrl, {
      cache: "no-store",
      headers: {
        "x-api-key": pingKey,
      },
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to reach upstream ping service",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 502 }
    );
  }
}
