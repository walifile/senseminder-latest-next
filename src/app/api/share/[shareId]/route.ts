import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import appConfig from "@/config/app-config";
import {
  INVALID_LINK_MESSAGE,
  TEMP_UNAVAILABLE_MESSAGE,
} from "@/app/dashboard/sense-cloud/constants/share-messages";

const isJsonRequest = (req: NextRequest) =>
  req.nextUrl.searchParams.get("mode") === "json" ||
  req.headers.get("accept")?.includes("application/json");

const buildTargetUrl = (req: NextRequest, shareId: string) => {
  const base = appConfig.BASE_URL.replace(/\/$/, "");
  const disposition = req.nextUrl.searchParams.get("disposition");
  const query = disposition
    ? `?disposition=${encodeURIComponent(disposition)}`
    : "";
  return `${base}/shares/${shareId}/download${query}`;
};

const parseMessage = async (res: Response) => {
  try {
    const payload = (await res.json()) as { message?: string };
    return payload.message || INVALID_LINK_MESSAGE;
  } catch {
    return INVALID_LINK_MESSAGE;
  }
};

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = (await ctx.params) || { shareId: "" };
  if (!shareId) {
    return NextResponse.json({ message: "shareId is required" }, { status: 400 });
  }
  const target = buildTargetUrl(req, shareId);

  if (!isJsonRequest(req)) {
    return NextResponse.redirect(target, 302);
  }

  try {
    const upstream = await fetch(target, { redirect: "manual" });
    const location = upstream.headers.get("location");

    if (upstream.status >= 300 && upstream.status < 400 && location) {
      return NextResponse.json({ downloadUrl: location });
    }

    const message = await parseMessage(upstream);
    return NextResponse.json({ message }, { status: upstream.status || 400 });
  } catch {
    return NextResponse.json(
      {
        message: TEMP_UNAVAILABLE_MESSAGE,
      },
      { status: 503 }
    );
  }
}

export const dynamic = "force-dynamic";
