"use client";

import { fetchAuthSession } from "aws-amplify/auth";

if (!process.env.NEXT_PUBLIC_BILLING_API_URL) {
  throw new Error("Missing NEXT_PUBLIC_BILLING_API_URL in .env.local");
}

const BILLING_API_URL = process.env.NEXT_PUBLIC_BILLING_API_URL;

async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

export const getPaymentMethods = async () => {
  const idToken = await getIdToken();
  console.log("idToken :", idToken);
  const response = await fetch(`${BILLING_API_URL}payment-methods`, {
    method: "GET",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch payment methods");
  }

  return response.json();
};

export const addPaymentMethod = async (body: any) => {
  const idToken = await getIdToken();
  console.log("idToken :", idToken);
  const response = await fetch(`${BILLING_API_URL}payment-methods`, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add payment methods");
  }

  return response.json();
};

export const setDefaultPaymentMethod = async (body: any) => {
  const idToken = await getIdToken();
  console.log("idToken :", idToken);
  const response = await fetch(`${BILLING_API_URL}set-default-card`, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to set default payment methods"
    );
  }

  return response.json();
};

export const getCurrentBalance = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${BILLING_API_URL}balance`, {
    method: "GET",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch payment methods");
  }

  return response.json();
};

export const getMonthlySpending = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${BILLING_API_URL}monthly-spending`, {
    method: "GET",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch monthly spending");
  }

  return response.json();
};

type InstanceBilling = {
  instanceId: string;
  billingPlan: string;
};

export const addBillingPlan = async (newPlan: InstanceBilling) => {
  const idToken = await getIdToken();
  console.log("idToken :", idToken);
  const response = await fetch(`${BILLING_API_URL}billing-plan`, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPlan),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add billing plan");
  }

  return response.json();
};

export const recharge = async (amount: any) => {
  const idToken = await getIdToken();
  console.log("idToken :", idToken);
  const response = await fetch(`${BILLING_API_URL}recharge`, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to recharge");
  }

  return response.json();
};

type SearchHistoryParams = {
  from?: Date | null; // ISO date string
  to?: Date | null; // ISO date string
  limit?: number;
  startingAfter?: string | null;
  isStorageHistory?: boolean | null;
};

export const searchUsageHistory = async ({
  from,
  to,
  limit = 5,
  startingAfter,
  isStorageHistory = false,
}: SearchHistoryParams) => {
  const idToken = await getIdToken();

  const queryParams = new URLSearchParams();
  console.log(`from: ${from}`);
  console.log(`from date: ${from?.toISOString().split("T")[0]}`);
  if (from) queryParams.append("startDate", formatAsYYYYMMDD(from));
  if (to) queryParams.append("endDate", formatAsYYYYMMDD(to));
  if (limit) queryParams.append("pageSize", limit.toString());
  if (startingAfter) queryParams.append("lastEvaluatedKey", startingAfter);
  console.log(`queryParams : ${queryParams.toString()}`);
  const storageUrl = isStorageHistory ? "/storage" : "";
  const url = `${BILLING_API_URL}usage-history${storageUrl}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to fetch smart pc usage history"
    );
  }

  return response.json();
};

export const searchRechargeHistory = async ({
  from,
  to,
  limit = 5,
  startingAfter,
}: SearchHistoryParams) => {
  const idToken = await getIdToken();

  const queryParams = new URLSearchParams();
  console.log(`from: ${from}`);
  console.log(`from date: ${from?.toISOString().split("T")[0]}`);
  if (from) queryParams.append("startDate", formatAsYYYYMMDD(from));
  if (to) queryParams.append("endDate", formatAsYYYYMMDD(to));
  if (limit) queryParams.append("pageSize", limit.toString());
  if (startingAfter) queryParams.append("startingAfter", startingAfter);
  console.log(`queryParams : ${queryParams.toString()}`);
  const url = `${BILLING_API_URL}recharge?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch recharge history");
  }

  return response.json();
};

function formatAsYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
