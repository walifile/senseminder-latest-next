"use client";

import { fetchAuthSession } from "aws-amplify/auth";

const PROFILE_API_URL =
  "https://41xpzcumx4.execute-api.us-east-1.amazonaws.com/prod/"; // adjust if needed

async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

// PATCH: Update profile (full name, country, and organization if owner)
export async function updateUserProfile(updateData: {
  firstName?: string;
  lastName?: string;
  country?: string;
  organization?: string; // Only used if owner
}) {
  const idToken = await getIdToken();

  const response = await fetch(PROFILE_API_URL, {
    method: "PATCH",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update profile");
  }

  return response.json();
}

// GET: Fetch current profile info (with organization name if admin/member)
export async function getUserProfile() {
  const idToken = await getIdToken();

  const response = await fetch(PROFILE_API_URL, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch profile");
  }

  return response.json();
}
