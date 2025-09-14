"use client";

import { fetchAuthSession } from "aws-amplify/auth";

import api from "./apiConfig";

const ASSIGN_API_URL = api.ASSIGN_API_URL;

async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

export async function assignPC(data: {
  memberId: string;
  instanceId: string;
  systemName: string;
}) {
  const idToken = await getIdToken();

  const response = await fetch(ASSIGN_API_URL, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to assign PC");
  }

  return response.json();
}

export async function unassignPC(data: {
  memberId: string;
  instanceId: string;
}) {
  const idToken = await getIdToken();

  const response = await fetch(ASSIGN_API_URL, {
    method: "DELETE",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to unassign PC");
  }

  return response.json();
}

export async function getAssignments() {
  const idToken = await getIdToken();

  const response = await fetch(ASSIGN_API_URL, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch assignments");
  }

  return response.json();
}
