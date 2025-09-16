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

/** GET /notifications  → latest personal + global notifications */
export async function getNotifications(): Promise<Notification[]> {
  const idToken = await getIdToken();

  const res = await fetch(NOTIFICATION_API, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`GET /notifications failed: ${res.status} ${msg}`);
  }

  const { notifications } = (await res.json()) as {
    notifications: Notification[];
  };
  return notifications;
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
