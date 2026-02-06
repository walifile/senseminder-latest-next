import appConfig from "@/config/app-config";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./apiUtils";

const BASE_URL = appConfig.SUPPORT_API_BASE;

export type Ticket = {
  id: string;
  ticketId: string;
  subject: string;
  status: string;
  createdAt: string;
  lastUpdated?: string;
};

export const ticketsAPI = createApi({
  reducerPath: "ticketsAPI",
  baseQuery: baseQueryWithReauth(true, BASE_URL),
  refetchOnMountOrArgChange: true,
  tagTypes: ["Tickets", "Ticket", "Messages"],
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: ({ userId }) => ({
        url: "tickets",
        method: "GET",
        headers: { "x-user-id": userId },
      }),
      providesTags: ["Tickets"],
    }),

    getTicketMessages: builder.query({
      query: ({ userId, id }) => ({
        url: `ticket/${id}/messages`,
        method: "GET",
        headers: { "x-user-id": userId },
      }),
      providesTags: ["Messages"],
    }),

    sendTicketMessage: builder.mutation({
      query: ({ userId, id, body }) => ({
        url: `ticket/${id}/message`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body,
      }),
      invalidatesTags: ["Messages"],
    }),

    getTicketById: builder.query({
      query: ({ userId, id }) => ({
        url: `ticket/${id}`,
        method: "GET",
        headers: { "x-user-id": userId },
      }),
      providesTags: ["Ticket"],
    }),

    createTicket: builder.mutation({
      query: ({ userId, body }) => ({
        url: "ticket",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body,
      }),
      invalidatesTags: ["Tickets"],
    }),

    updateTicketStatus: builder.mutation({
      query: ({ userId, id, status }) => ({
        url: `ticket/${id}/status`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: { status },
      }),
      invalidatesTags: ["Tickets", "Ticket"],
    }),

    updateTicketPriority: builder.mutation({
      query: ({ userId, id, priority }) => ({
        url: `ticket/${id}/priority`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: { priority },
      }),
    }),

    assignTicket: builder.mutation({
      query: ({ userId, id, assignedTo }) => ({
        url: `ticket/${id}/assign`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: { assignedTo },
      }),
    }),

    presignTicketUpload: builder.mutation({
      query: ({ userId, ticketId, body }) => ({
        url: `ticket/${ticketId}/presign-upload`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body,
      }),
    }),

    presignTicketUpload2: builder.mutation({
      query: ({ userId, body }) => ({
        url: "presign-upload-2",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body,
      }),
    }),

    presignTicketDownload: builder.mutation({
      query: ({ userId, ticketId, fileKey }) => ({
        url: `ticket/${ticketId}/presign-download`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: { fileKey },
      }),
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  usePresignTicketUploadMutation,
  usePresignTicketUpload2Mutation,
  usePresignTicketDownloadMutation,
  useGetTicketMessagesQuery,
  useSendTicketMessageMutation,
  useUpdateTicketPriorityMutation,
} = ticketsAPI;
