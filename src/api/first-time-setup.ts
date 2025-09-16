import appConfig from "@/config/app-config";

import { fetchAuthSession } from "aws-amplify/auth";

const { FIRST_TIME_TOKEN_URL } = appConfig;

async function getIdToken(): Promise<string> {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

export async function checkFirstLogin() {
  const idToken = await getIdToken();

  const response = await fetch(FIRST_TIME_TOKEN_URL, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to check first login.");
  }

  return response.json(); // expects { firstLogin: boolean, federatedUser: boolean }
}
