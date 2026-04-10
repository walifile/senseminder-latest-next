"use client";

import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { PROFILE_API_URL } = appConfig;

export type UserProfile = {
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  organization?: string;
  isBusiness?: boolean;
  role?: string;
  avatarUrl?: string;
};

type AvatarUploadUrlResponse = {
  uploadUrl: string;
  key?: string;
};

type BusinessDetailsPayload = {
  teamSize: number;
  pcCount: number;
  businessUseCase: string;
};

export const profileManagementAPI = createApi({
  reducerPath: "profileManagementAPI",
  baseQuery: baseQueryWithReauth(true, PROFILE_API_URL),
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
    }),
    updateUserProfile: builder.mutation<
      UserProfile,
      {
        firstName?: string;
        lastName?: string;
        country?: string;
        organization?: string;
      }
    >({
      query: (body) => ({
        url: "",
        method: "PATCH",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    createAvatarUploadUrl: builder.mutation<
      AvatarUploadUrlResponse,
      {
        contentType: string;
        fileExt: string;
      }
    >({
      query: (body) => ({
        url: "avatar",
        method: "POST",
        body: {
          ...body,
          type: "avatar",
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    createBusinessDetails: builder.mutation<unknown, BusinessDetailsPayload>({
      query: (body) => ({
        url: "avatar",
        method: "POST",
        body: {
          ...body,
          type: "businessDetails",
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    deleteAvatar: builder.mutation<unknown, void>({
      query: () => ({
        url: "avatar",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useCreateAvatarUploadUrlMutation,
  useCreateBusinessDetailsMutation,
  useDeleteAvatarMutation,
} = profileManagementAPI;

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
