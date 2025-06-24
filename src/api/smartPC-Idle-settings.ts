"use client";

import { fetchAuthSession } from "aws-amplify/auth";

const IDLE_API_URL = "https://mga45cl1h6.execute-api.us-east-1.amazonaws.com/prod/";

// Helper to get ID token
async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

// ==========================
// POST: Set or update idle timeout
// ==========================
export async function setIdleTimeout(instanceId: string, timeout: number) {
  const idToken = await getIdToken();

  const response = await fetch(IDLE_API_URL, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ instanceId, timeout }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to set idle timeout");
  }

  return data;
}

// ==========================
// GET: Get idle timeout for an instance
// ==========================
export async function getIdleTimeout(instanceId: string) {
  const idToken = await getIdToken();

  const response = await fetch(IDLE_API_URL, {
    method: "GET",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ instanceId }), // Backend supports JSON body
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch idle timeout");
  }

  return data;
}

// ==========================
// DELETE: Delete idle timeout entry
// ==========================
export async function deleteIdleTimeout(instanceId: string) {
  const idToken = await getIdToken();

  const response = await fetch(IDLE_API_URL, {
    method: "DELETE",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ instanceId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete idle timeout");
  }

  return data;
}
