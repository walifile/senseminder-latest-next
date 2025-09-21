"use client";

import appConfig from "@/config/app-config";

import { fetchAuthSession } from "aws-amplify/auth";

const { PROMO_API_URL } = appConfig;

async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

// Check eligibility
export async function getPromoInfo() {
  const idToken = await getIdToken();

  const response = await fetch(PROMO_API_URL, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch promo info");
  }

  return response.json(); // { eligible: true/false, reason: string }
}

// Redeem promo credits
export async function redeemPromo() {
  const idToken = await getIdToken();

  const response = await fetch(PROMO_API_URL, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // body empty, user identified from ID token
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to redeem promo");
  }

  return response.json(); // { message, amountAdded, promoId }
}
