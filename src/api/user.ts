// "use client";

// import { fetchAuthSession } from "aws-amplify/auth";

// const API_URL = "https://v0605yjfrf.execute-api.us-east-1.amazonaws.com/prod/";

// export async function inviteUser(userData: {
//   name: string;
//   email: string;
//   role: "admin" | "member";
//   group: string;
// }) {
//   try {
//     const session = await fetchAuthSession();
//     const idToken = session.tokens?.idToken?.toString();

//     if (!idToken) {
//       throw new Error("User is not authenticated.");
//     }

//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         Authorization: idToken,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userData),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to invite user");
//     }

//     return response.json();
//   } catch (error) {
//     throw error;
//   }
// }


"use client";

import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = "https://v0605yjfrf.execute-api.us-east-1.amazonaws.com/prod/";

async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

export async function inviteUser(userData: {
  name: string;
  email: string;
  role: "admin" | "member";
  group: string;
}) {
  const idToken = await getIdToken();

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to invite user");
  }

  return response.json();
}

export async function getUsers() {
  const idToken = await getIdToken();

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch users");
  }

  return response.json();
}

export async function deleteUser(email: string, role: "admin" | "member") {
  const idToken = await getIdToken();

  const response = await fetch(API_URL, {
    method: "DELETE",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete user");
  }

  return response.json();
}
