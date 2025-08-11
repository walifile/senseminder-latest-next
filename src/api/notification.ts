
import { fetchAuthSession } from 'aws-amplify/auth';
import { Notification } from '@/types/notification'; // ✅ NOT local declaration

const API_BASE = 'https://yns7wkdio7.execute-api.us-east-1.amazonaws.com/dev/';


/** Returns a valid Cognito ID token for the current user */
async function getIdToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token   = session.tokens?.idToken?.toString();
  if (!token) throw new Error('No Cognito idToken available');
  return token;
}

/* ─────────────── Public API ─────────────── */

/** GET /notifications  → latest personal + global notifications */
export async function getNotifications(): Promise<Notification[]> {
  const idToken = await getIdToken();

  const res = await fetch(API_BASE, {
    method: 'GET',
    headers: {
      Authorization: idToken,
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`GET /notifications failed: ${res.status} ${msg}`);
  }

  const { notifications } = (await res.json()) as { notifications: Notification[] };
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

  const body =
    Array.isArray(ts)
      ? { timestamps: ts }
      : { timestamp: ts };

  const res = await fetch(API_BASE, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: idToken,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`PATCH /notifications failed: ${res.status} – ${msg}`);
  }
}
