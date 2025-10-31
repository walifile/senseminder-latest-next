import { NextRequest, NextResponse } from "next/server";
import appConfig from "@/config/app-config";

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
