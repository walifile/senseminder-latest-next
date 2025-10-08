"use client";

import { useEffect, useState } from "react";

import { fetchAuthSession } from "aws-amplify/auth";

export function useEmailFromSession() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (!idToken) return;

        const [, payloadBase64] = idToken.split(".");
        const decodedPayload = JSON.parse(
          Buffer.from(payloadBase64, "base64").toString("utf8")
        );

        if (decodedPayload.email) {
          setEmail(decodedPayload.email);
        }
      } catch (err) {
        console.error("Failed to load email:", err);
        setError("Failed to load email");
      } finally {
        setLoading(false);
      }
    };

    loadEmail();
  }, []);

  return { email, loading, error };
}
