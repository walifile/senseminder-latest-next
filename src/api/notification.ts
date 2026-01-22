import type { Notification } from "@/types/notification"; // ✅ NOT local declaration

import appConfig from "@/config/app-config";

import { fetchAuthSession } from "aws-amplify/auth";

const { NOTIFICATION_API } = appConfig;

/** Returns a valid Cognito ID token for the current user */
async function getIdToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("No Cognito idToken available");
  return token;
}

/* ─────────────── Public API ─────────────── */

export type GetNotificationsParams = {
  limit?: number;
  nextToken?: string | null;
};

export type GetNotificationsResponse = {
  notifications: Notification[];
  nextToken?: string | null;
};

/**
 * GET /notifications
 *
 * ✅ Backwards compatible:
 * - If you call getNotifications() with no args -> returns Notification[]
 * ✅ New pagination support:
 * - If you call getNotifications({ limit, nextToken }) -> returns { notifications, nextToken }
 */
export async function getNotifications(): Promise<Notification[]>;
export async function getNotifications(
  params: GetNotificationsParams
): Promise<GetNotificationsResponse>;
export async function getNotifications(
  params?: GetNotificationsParams
): Promise<Notification[] | GetNotificationsResponse> {
  const idToken = await getIdToken();

  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.nextToken) qs.set("nextToken", params.nextToken);

  const url = `${NOTIFICATION_API}${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`GET /notifications failed: ${res.status} ${msg}`);
  }

  const data = (await res.json()) as {
    notifications?: Notification[];
    nextToken?: string | null;
  };

  const notifications = Array.isArray(data?.notifications) ? data.notifications : [];
  const nextToken = data?.nextToken ?? null;

  // Backward compatible return shape
  if (!params) return notifications;

  return { notifications, nextToken };
}

/**
 * PATCH /notifications  → mark read
 * Accepts either a single timestamp or an array.
 */
export async function markNotificationsAsRead(
  ts: string | string[]
): Promise<void> {
  const idToken = await getIdToken();

  const body = Array.isArray(ts) ? { timestamps: ts } : { timestamp: ts };

  const res = await fetch(NOTIFICATION_API, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: idToken,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`PATCH /notifications failed: ${res.status} – ${msg}`);
  }
}
