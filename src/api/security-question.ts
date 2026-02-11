"use client";

import appConfig from "@/config/app-config";

import { fetchAuthSession } from "aws-amplify/auth";

const { SECURITY_QUESTION_API } = appConfig;

async function getIdToken(): Promise<string> {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

// ===== GET: fetch existing question (if any) =====
export async function getSecurityQuestion(): Promise<{
  question: string;
} | null> {
  const idToken = await getIdToken();

  const response = await fetch(SECURITY_QUESTION_API, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to load security question");
  }

  return response.json();
}

// ===== POST: set or update question =====
export async function setSecurityQuestion(data: {
  question: string;
  answer: string;
  oldAnswer?: string;
}): Promise<{ message: string }> {
  const idToken = await getIdToken();

  const response = await fetch(SECURITY_QUESTION_API, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to save security question");
  }

  return response.json();
}
