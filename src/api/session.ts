import { fetchAuthSession } from "aws-amplify/auth";
import { UAParser } from "ua-parser-js";

export interface SmartPCSession {
  sessionId: string;
  deviceName?: string;
  ip?: string;
  lastSeen?: string;
  occupied?: boolean;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  isCurrentSession?: boolean;
  locationDisplay?: string;
}

const IPIFY_URL = process.env.NEXT_PUBLIC_IPIFY_URL!;
const CLIENT_SESSION_API = process.env.NEXT_PUBLIC_CLIENT_SESSION_API;

if (!IPIFY_URL) {
  throw new Error("Missing NEXT_PUBLIC_IPIFY_URL in .env file");
}

if (!CLIENT_SESSION_API) {
  throw new Error("Missing NEXT_PUBLIC_CLIENT_SESSION_API in .env file");
}

export const updateSessionHeartbeat = async () => {
  try {
    const sessionId = localStorage.getItem("smartpc-session-id");
    if (!sessionId) {
      console.warn("No sessionId in localStorage. Skipping heartbeat.");
      return;
    }

    const { idToken } = (await fetchAuthSession()).tokens ?? {};
    if (!idToken) {
      console.warn("No ID token found.");
      return;
    }

    const ip = await fetch(IPIFY_URL)
      .then((res) => res.json())
      .then((data) => data.ip)
      .catch(() => "unknown");

    const parser = new UAParser();
    const result = parser.getResult();
    const deviceName = `${result.browser.name} on ${result.os.name}`;

    const res = await fetch(CLIENT_SESSION_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken.toString()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "heartbeat",
        sessionId,
        ip,
        deviceName,
      }),
    });

    if (res.ok) {
      console.log(" Heartbeat updated for session:", sessionId);
    } else {
      console.warn("Failed to update heartbeat:", await res.text());
    }
  } catch (err) {
    console.error(" Heartbeat error:", err);
  }
};

export const claimSessionIfAvailable = async () => {
  try {
    const { idToken } = (await fetchAuthSession()).tokens ?? {};
    if (!idToken) {
      console.warn("No ID token available. User might be logged out.");
      return;
    }

    const prevSessionId = localStorage.getItem("smartpc-session-id");

    const ip = await fetch(IPIFY_URL)
      .then((res) => res.json())
      .then((data) => data.ip)
      .catch(() => "unknown");

    const parser = new UAParser();
    const result = parser.getResult();
    const deviceName = `${result.browser.name} on ${result.os.name}`;

    const response = await fetch(CLIENT_SESSION_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken.toString()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "claim",
        ip,
        deviceName,
      }),
    });

    const data = await response.json();

    if (response.ok && data.sessionId) {
      const newSessionId = data.sessionId;

      if (prevSessionId && prevSessionId !== newSessionId) {
        console.log("⚠️ Replacing old session ID:", prevSessionId);
        // Optionally invalidate old session by calling another API
        // await invalidateOldSession(prevSessionId, idToken);
      }

      localStorage.setItem("smartpc-session-id", newSessionId);
      console.log("Session claimed:", newSessionId);
    } else {
      console.warn("No unclaimed session available:", data.message || data);
    }
  } catch (err) {
    console.error("Failed to claim session:", err);
  }
};

export const fetchActiveSessions = async (): Promise<SmartPCSession[]> => {
  try {
    const { idToken } = (await fetchAuthSession()).tokens ?? {};
    if (!idToken) throw new Error("No ID token found");

    const res = await fetch(CLIENT_SESSION_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken.toString()}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(await res.text());
    const raw = await res.json();

    const currentId = localStorage.getItem("smartpc-session-id");

    return (raw as any[]).map((s) => {
      const location = s.location || {};
      const locationDisplay =
        location.city || location.region || location.country
          ? `${location.city || "?"}, ${
              location.country || location.region || "?"
            }`
          : "Unknown";

      return {
        sessionId: s.sessionId,
        deviceName: s.deviceName || "Unknown Device",
        ip: s.ip || "N/A",
        lastSeen: new Date(s.lastSeen).toLocaleString(),
        location,
        locationDisplay,
        occupied: s.occupied,
        isCurrentSession: s.sessionId === currentId,
      };
    });
  } catch (err) {
    console.error("Failed to fetch sessions:", err);
    return [];
  }
};
