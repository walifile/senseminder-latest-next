import { useState, useEffect, useCallback } from "react";

import { fetchAuthSession } from "aws-amplify/auth";

interface SessionStatus {
  isExpired: boolean;
  expiresAt: number;
}

export function useCognitoSessionCheck(intervalMs = 60_000) {
  const [status, setStatus] = useState<SessionStatus>({
    isExpired: true,
    expiresAt: 0,
  });

  const checkSession = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const at = session.tokens?.accessToken;
      if (!at) throw new Error("No access token");

      const expiresAt = at.payload.exp as number;
      const now = Math.floor(Date.now() / 1000);
      const isExpired = expiresAt <= now;

      setStatus({ isExpired, expiresAt });

      if (!isExpired && expiresAt - now < 300) {
        await fetchAuthSession({ forceRefresh: true });
        await checkSession();
      }
    } catch {
      setStatus({ isExpired: true, expiresAt: 0 });
    }
  }, []);

  useEffect(() => {
    checkSession();
    const id = setInterval(checkSession, intervalMs);
    return () => clearInterval(id);
  }, [checkSession, intervalMs]);

  return status;
}
