import {
  format,
  isToday,
  isYesterday,
  formatDistanceToNow,
} from "date-fns";

/** Resolve client timezone, fallback to UTC */
function getClientTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * API may return:
 *  - 2025-12-18T05:42:25.089074   (no timezone, microseconds)
 *  - 2025-12-18T05:42:25.089074Z (UTC w/ microseconds)
 * We normalize to:
 *  - 2025-12-18T05:42:25.089Z
 * and if no timezone is present, we assume UTC by appending Z.
 */
function normalizeApiTimestampToIso(ts: string): string {
  if (!ts) return ts;

  // has timezone suffix? (Z or ±hh:mm)
  const hasTz = /([zZ]|[+-]\d{2}:\d{2})$/.test(ts);

  // Split base + fractional + tz
  const m = ts.match(/^(.+?)(\.\d+)?([zZ]|[+-]\d{2}:\d{2})?$/);
  if (!m) return ts;

  const base = m[1];
  const fracDigits = m[2] ? m[2].slice(1) : ""; // remove "."
  const tz = m[3] || "";

  // Trim/Pad to milliseconds for broad browser support
  const ms = fracDigits ? fracDigits.padEnd(3, "0").slice(0, 3) : "";
  const rebuilt = ms ? `${base}.${ms}${tz}` : `${base}${tz}`;

  return hasTz ? rebuilt : `${rebuilt}Z`;
}

function toDate(input: Date | string | number): Date {
  if (input instanceof Date) return input;
  if (typeof input === "string") return new Date(normalizeApiTimestampToIso(input));
  return new Date(input);
}

export const formatTimeLabel = (date: Date | string | number): string => {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return "";

  const timeZone = getClientTimeZone();

  try {
    // Local time with timezone label (e.g., "12:42 AM EST")
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(d);
  } catch {
    // Fallback to UTC
    return new Intl.DateTimeFormat(undefined, {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(d);
  }
};

export const formatDateLabel = (dateStr: string): string => {
  const d = toDate(dateStr);
  if (Number.isNaN(d.getTime())) return "";

  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d");
};

export const formatRelativeTime = (
  date: Date | string | number,
  addSuffix: boolean = true
): string => {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix });
};

export const formatDate = (date: Date | string | number): string => {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "dd/MM/yyyy");
};

export const formatDateTime = (
  date: Date | string | number,
  pattern: string = "yyyy-MM-dd HH:mm"
): string => {
  if (!date) return "";
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, pattern);
};

export function formatAsYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}