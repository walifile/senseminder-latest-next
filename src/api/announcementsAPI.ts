import type {
  GetAnnouncementsArgs,
  GetAnnouncementsResponse,
} from "@/components/shared/announcement/announcement-bar.types";

import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const { ANNOUNCEMENTS_API_URL } = appConfig;

export const isAnnouncementsApiConfigured = Boolean(ANNOUNCEMENTS_API_URL);

export const announcementsAPI = createApi({
  reducerPath: "announcementsAPI",
  baseQuery: baseQueryWithReauth(false, ANNOUNCEMENTS_API_URL),
  tagTypes: ["Announcements"],
  endpoints: (builder) => ({
    getAnnouncements: builder.query<GetAnnouncementsResponse, GetAnnouncementsArgs>({
      query: ({ path, placement = "public", auth = false }) => {
        const params = new URLSearchParams({
          path,
          placement,
          auth: auth ? "1" : "0",
        });

        return {
          url: `announcements?${params.toString()}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useGetAnnouncementsQuery } = announcementsAPI;
