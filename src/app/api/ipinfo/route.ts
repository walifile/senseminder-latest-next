import { NextResponse } from "next/server";
import { getServerConfig } from "@/config/app-config";

const serverEnv = getServerConfig();

export async function GET() {
  try {
    const url = new URL(serverEnv.IPINFO_URL);
    url.searchParams.set("token", serverEnv.IPINFO_TOKEN);

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to fetch IP information",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 502 }
    );
  }
}
