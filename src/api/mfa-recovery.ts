"use client";

import api from "./apiConfig";

const MFA_API_URL = api.MFA_API_URL;

export async function checkMfaStatus(email: string) {
  const url = new URL(MFA_API_URL);
  url.searchParams.set("check", "1");
  url.searchParams.set("email", email);

  const response = await fetch(url.toString(), {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to check MFA status");
  }

  return response.json();
}

export async function sendRecoveryEmail(email: string) {
  const response = await fetch(MFA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to send recovery email");
  }

  return response.json();
}

export async function sendTotpRecovery(email: string) {
  const response = await fetch(MFA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      action: "disable-totp",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to send TOTP recovery email");
  }

  return response.json();
}
