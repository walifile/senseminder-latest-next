import { fetchAuthSession } from "@aws-amplify/auth";

import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
) {
  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const maybeError = error as {
      data?: { message?: unknown };
      message?: unknown;
      error?: unknown;
    };

    if (typeof maybeError.data?.message === "string")
      return maybeError.data.message;
    if (typeof maybeError.message === "string") return maybeError.message;
    if (typeof maybeError.error === "string") return maybeError.error;
  }

  return fallback;
}
