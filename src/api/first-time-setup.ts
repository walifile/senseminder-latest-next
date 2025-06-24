import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = "https://qlabwdtr71.execute-api.us-east-1.amazonaws.com/prod/";

async function getIdToken(): Promise<string> {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

export async function checkFirstLogin() {
  const idToken = await getIdToken();

  const response = await fetch(API_URL, {
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
