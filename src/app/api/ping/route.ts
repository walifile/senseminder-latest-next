import type { NextRequest} from "next/server";

import { NextResponse } from "next/server";
import { getServerConfig } from "@/config/app-config";

const serverEnv = getServerConfig();

const REGION_TO_URL: Record<string, string> = {
  default: serverEnv.PING_API_URL,
  storage: serverEnv.STORAGE_PING_URL,
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const target = searchParams.get("target") ?? "default";
  const upstreamUrl = REGION_TO_URL[target];

  if (!upstreamUrl) {
    return NextResponse.json(
      { error: "Unknown ping target" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(upstreamUrl, {
      cache: "no-store",
      headers: {
        "x-api-key": serverEnv.PING_API_KEY,
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
