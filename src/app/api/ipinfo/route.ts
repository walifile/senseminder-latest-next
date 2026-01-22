import { NextResponse } from "next/server";
import appConfig from "@/config/app-config";

const resolveIpInfoConfig = () => {
  const ipinfoUrl = appConfig.IPINFO_URL || process.env.NEXT_PUBLIC_IPINFO_URL;

  const ipinfoToken =
    appConfig.IPINFO_TOKEN || process.env.NEXT_PUBLIC_IPINFO_TOKEN;

  return { ipinfoUrl, ipinfoToken };
};

export async function GET() {
  try {
    const { ipinfoUrl, ipinfoToken } = resolveIpInfoConfig();
    if (!ipinfoUrl || !ipinfoToken) {
      return NextResponse.json(
        {
          error: "IPINFO configuration missing",
          details: {
            ipinfoUrl: Boolean(ipinfoUrl),
            ipinfoToken: Boolean(ipinfoToken),
          },
        },
        { status: 500 }
      );
    }
    const url = new URL(ipinfoUrl);
    url.searchParams.set("token", ipinfoToken);

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
