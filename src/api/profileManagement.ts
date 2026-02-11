"use client";

import appConfig from "@/config/app-config";

import { fetchAuthSession } from "aws-amplify/auth";

const { PROFILE_API_URL } = appConfig;

type ApiErrorResponse = {
  message?: string;
};

type AvatarUploadUrlResponse = {
  uploadUrl: string;
  key?: string;
};

function joinUrl(base: string, path: string) {
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

async function getIdToken() {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("User is not authenticated.");
  return idToken;
}

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function throwApiError(res: Response, fallbackMessage: string): Promise<never> {
  const data = await parseJson<ApiErrorResponse>(res);
  throw new Error(data?.message || fallbackMessage);
}

export async function updateUserProfile(updateData: {
  firstName?: string;
  lastName?: string;
  country?: string;
  organization?: string; // Only used if owner
}) {
  const idToken = await getIdToken();

  const response = await fetch(PROFILE_API_URL, {
    method: "PATCH",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to update profile");
  }

  return response.json();
}

export async function getUserProfile() {
  const idToken = await getIdToken();

  const response = await fetch(PROFILE_API_URL, {
    method: "GET",
    headers: {
      Authorization: idToken,
    },
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch profile");
  }

  return response.json();
}

export async function createAvatarUploadUrl(input: {
  contentType: string; // e.g. "image/png"
  fileExt: string; // e.g. "png"
}) {
  const idToken = await getIdToken();

  const response = await fetch(joinUrl(PROFILE_API_URL, "/avatar"), {
    method: "POST",
    headers: {
      Authorization: idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to create avatar upload url");
  }

  const data = await response.json();
  return data as AvatarUploadUrlResponse;
}


export async function uploadAvatarToS3(args: { uploadUrl: string; file: File }) {
  const { uploadUrl, file } = args;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to upload avatar to S3");
  }

  return true;
}


export async function deleteAvatar() {
  const idToken = await getIdToken();

  const response = await fetch(joinUrl(PROFILE_API_URL, "/avatar"), {
    method: "DELETE",
    headers: {
      Authorization: idToken,
    },
  });

  if (!response.ok) {
    await throwApiError(response, "Failed to remove avatar");
  }

  return response.json();
}
