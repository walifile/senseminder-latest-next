import type { AnnouncementItem, AnnouncementPlacement } from "./announcement-bar.types";

const DASHBOARD_PREFIX = "/dashboard";
const PC_VIEWER_PREFIX = "/pc-viewer";
const DEFAULT_VERSION = 1;

export function getAnnouncementPlacement(pathname: string): AnnouncementPlacement {
  return pathname.startsWith(DASHBOARD_PREFIX) ? "dashboard" : "public";
}

export function shouldHideAnnouncementBar(pathname: string): boolean {
  return pathname.startsWith(PC_VIEWER_PREFIX);
}

export function getAnnouncementDismissKey(
  item: Pick<AnnouncementItem, "announcement_id" | "version">
): string {
  return `banner:dismissed:${item.announcement_id}:v${item.version ?? DEFAULT_VERSION}`;
}
