import { fetchAuthSession } from "aws-amplify/auth";

export type AuthHeaderScheme = "raw" | "bearer";

export async function getIdToken(): Promise<string> {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

export async function getIdTokenSafe(): Promise<string | null> {
  try {
    return await getIdToken();
  } catch {
    return null;
  }
}

export function formatAuthorizationHeader(
  idToken: string,
  scheme: AuthHeaderScheme = "raw"
): string {
  return scheme === "bearer" ? `Bearer ${idToken}` : idToken;
}

export async function attachAuthorizationHeader(
  headers: Headers,
  scheme: AuthHeaderScheme = "raw"
): Promise<Headers> {
  const idToken = await getIdToken();
  headers.set("Authorization", formatAuthorizationHeader(idToken, scheme));
  return headers;
}
