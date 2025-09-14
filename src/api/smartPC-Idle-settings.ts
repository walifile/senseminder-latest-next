"use client";

import { fetchAuthSession } from "aws-amplify/auth";

import api from "./apiConfig";

const IDLE_API_URL = api.IDLE_API_URL;

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
