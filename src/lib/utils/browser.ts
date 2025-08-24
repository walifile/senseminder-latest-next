export function getSessionItemSafe(key: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(key);
}

export function setSessionItemSafe(key: string, value: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, value);
  }
}

export function removeSessionItemSafe(key: string) {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(key);
  }
}
