import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

import { getIdToken as getAuthIdToken } from "@/lib/auth/token";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getIdToken() {
  return getAuthIdToken();
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

    if (
      typeof (maybeError.data as { error?: unknown })?.error === "string"
    ) {
      return (maybeError.data as { error: string }).error;
    }

    if (typeof maybeError.message === "string") return maybeError.message;
    if (typeof maybeError.error === "string") return maybeError.error;
  }

  return fallback;
}


export function ensureOkInstanceId(instanceId: string) {
  if (!instanceId || typeof instanceId !== "string") {
    throw new Error("Missing instanceId.");
  }
}

export async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}
