import { createApi } from "@reduxjs/toolkit/query/react";
import api from "@/api/apiConfig";
import { baseQueryWithReauth } from "./apiUtils";

const BASE_URL = api?.SUPPORT_API_BASE;
if (!BASE_URL) throw new Error("Missing SUPPORT_API_BASE in apiConfig");

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
  baseQuery: baseQueryWithReauth(false), 
  refetchOnMountOrArgChange: true,
  tagTypes: ["Tickets", "Ticket", "Messages"],
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: ({ userId }) => ({
        url: `${BASE_URL}/tickets`,
        method: "GET",
        headers: { "x-user-id": userId },
      }),
      providesTags: ["Tickets"],
    }),

    getTicketMessages: builder.query({
      query: ({ userId, id }) => ({
        url: `${BASE_URL}/ticket/${id}/messages`,
        method: "GET",
        headers: { "x-user-id": userId },
      }),
      providesTags: ["Messages"],
    }),

    sendTicketMessage: builder.mutation({
      query: ({ userId, id, body }) => ({
        url: `${BASE_URL}/ticket/${id}/message`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body,
      }),
      invalidatesTags: ["Messages",],
    }),

    getTicketById: builder.query({
      query: ({ userId, id }) => ({
        url: `${BASE_URL}/ticket/${id}`,
        method: "GET",
        headers: { "x-user-id": userId },
      }),
      providesTags: ["Ticket"],
    }),

    createTicket: builder.mutation({
      query: ({ userId, body }) => ({
        url: `${BASE_URL}/ticket`,
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
        url: `${BASE_URL}/ticket/${id}/status`,
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
        url: `${BASE_URL}/ticket/${id}/priority`,
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
        url: `${BASE_URL}/ticket/${id}/assign`,
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
      url: `${BASE_URL}/ticket/${ticketId}/presign-upload`,
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
        url: `${BASE_URL}/presign-upload-2`,
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
        url: `${BASE_URL}/ticket/${ticketId}/presign-download`,
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
