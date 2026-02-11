"use client";

import { useState, useEffect } from "react";
import { useLazyGetUserProfileQuery } from "@/api/profileManagement";

import { getIdToken } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";

export function useSubUserInfo() {
  const [isSubUser, setIsSubUser] = useState(false);
  const [organization, setOrganization] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerGetUserProfile] = useLazyGetUserProfileQuery();

  useEffect(() => {
    const detectSubUserAndOrg = async () => {
      try {
        const token = await getIdToken();
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString("utf8")
        );

        if (payload["custom:ownerid"]) {
          setIsSubUser(true);
          setRole(payload["custom:role"] || null);

          const profile = await triggerGetUserProfile().unwrap();
          setOrganization(profile.organization || null);
        }
      } catch (err) {
        Logger.error("Failed to detect sub-user or fetch org:", err);
        setError("Failed to load user organization or role");
      } finally {
        setLoading(false);
      }
    };

    detectSubUserAndOrg();
  }, []);

  return { isSubUser, organization, role, loading, error };
}
