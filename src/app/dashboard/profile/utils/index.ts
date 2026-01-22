// src/app/dashboard/profile/utils/index.ts

export const getErrorName = (err: unknown): string | undefined => {
  if (!err || typeof err !== "object") return undefined;
  const anyErr = err as { name?: string; code?: string; __type?: string };
  return anyErr.name ?? anyErr.code ?? anyErr.__type;
};

export const getChangePasswordErrorMessage = (err: unknown): string => {
  const name = getErrorName(err);
  const rawMessage =
    err instanceof Error ? err.message : "Failed to change password.";

  if (
    name === "NotAuthorizedException" ||
    rawMessage.toLowerCase().includes("incorrect username or password")
  ) {
    return "Current password is incorrect.";
  }

  if (name === "InvalidPasswordException") {
    return "New password does not meet the required password policy.";
  }

  if (name === "TooManyRequestsException" || name === "LimitExceededException") {
    return "Too many attempts. Please try again in a moment.";
  }

  return rawMessage;
};

export const getClientTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

export const toDateSafe = (value: unknown): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const ms = value < 1_000_000_000_000 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;

    if (/^\d+$/.test(s)) {
      const n = Number(s);
      const ms = n < 1_000_000_000_000 ? n * 1000 : n;
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
};

export const formatLastActivity = (value: unknown): string => {
  const d = toDateSafe(value);
  if (!d) return "Unknown";

  const tz = getClientTimeZone();

  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(d);
  }
};


type CognitoIdentity = { providerType?: string };
type JwtPayloadWithIdentities = { identities?: CognitoIdentity[] };

function hasIdentitiesPayload(v: unknown): v is JwtPayloadWithIdentities {
  if (!v || typeof v !== "object") return false;
  return "identities" in v;
}

export function decodeJwtPayload(token: string): unknown | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "===".slice((b64.length + 3) % 4);

    const json = atob(padded);
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

export function isFederatedIdToken(token: string): boolean {
  const decoded = decodeJwtPayload(token);
  if (!hasIdentitiesPayload(decoded)) return false;

  const identities = decoded.identities;
  if (!Array.isArray(identities)) return false;

  return identities.some((id) =>
    ["google", "apple"].includes(String(id?.providerType ?? "").toLowerCase())
  );
}
