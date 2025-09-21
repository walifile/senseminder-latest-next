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
): string {
  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const maybeError = error as {
      data?: unknown;
      message?: unknown;
      error?: unknown;
    };

    if (typeof maybeError.data === "string") return maybeError.data;

    if (
      typeof (maybeError.data as { message?: unknown })?.message === "string"
    ) {
      return (maybeError.data as { message: string }).message;
    }

    if (typeof maybeError.message === "string") return maybeError.message;
    if (typeof maybeError.error === "string") return maybeError.error;
  }

  return fallback;
}
