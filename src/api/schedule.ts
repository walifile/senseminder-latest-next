import { fetchAuthSession } from "aws-amplify/auth";

const BASE_URL = process.env.NEXT_PUBLIC_SAVE_VM_SCHEDULE_URL!;

if (!BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SAVE_VM_SCHEDULE_URL in .env file");
}

export type Schedule = {
  instanceId: string;
  timeZone: string;
  frequency: "everyday" | "weekdays" | "weekends" | "custom";
  startDate?: string;
  endDate?: string;
  autoStartTime?: string;
  autoStopTime?: string;
  enabled?: boolean;
  createdAt?: string;
};

async function getIdToken(): Promise<string> {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

export async function saveSchedule(data: Schedule): Promise<Schedule> {
  const idToken = await getIdToken();
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to save schedule");
  }

  const result = await res.json();
  return result.data;
}

export async function getSchedule(
  instanceId: string
): Promise<Schedule | null> {
  const idToken = await getIdToken();
  const url = `${BASE_URL}?instanceId=${encodeURIComponent(instanceId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch schedule");
  }

  const result = await res.json();
  return result.data;
}

export async function deleteSchedule(instanceId: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(BASE_URL, {
    method: "DELETE",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ instanceId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete schedule");
  }
}
