import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { fetchAuthSession } from "@aws-amplify/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}
