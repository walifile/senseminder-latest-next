/* eslint-disable perfectionist/sort-imports, perfectionist/sort-named-imports */

import appConfig from "@/config/app-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: { params: { shareId: string } }
) {
  const { shareId } = ctx.params || { shareId: "" };
  if (!shareId) {
    return NextResponse.json({ message: "shareId is required" }, { status: 400 });
  }
  const base = appConfig.BASE_URL.replace(/\/$/, "");
  const disposition = req.nextUrl.searchParams.get("disposition");
  const query = disposition ? `?disposition=${encodeURIComponent(disposition)}` : "";
  const target = `${base}/shares/${shareId}/download${query}`;
  return NextResponse.redirect(target, 302);
}

export const dynamic = "force-dynamic";
