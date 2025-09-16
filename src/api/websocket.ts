// src/api/websocket.ts

import type { Notification } from "@/types/notification";

import appConfig from "@/config/app-config";

let socket: WebSocket | null = null;

export function connectWebSocket(
  userId: string,
  onMessage?: (data: Notification) => void
): WebSocket {
  if (socket) return socket;

  const role = "customer";
  const baseWsUrl = appConfig.WEBSOCKET_URL;

  const wsUrl = `${baseWsUrl}?userId=${userId}&role=${role}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("[WebSocket Connected]");
  };

  socket.onmessage = (event) => {
    try {
      const data: Notification = JSON.parse(event.data);
      console.log("[WebSocket Message Received]:", data);
      if (onMessage) onMessage(data);
    } catch (err) {
      console.warn("WebSocket message is not JSON:", event.data);
      console.log("Error details:", err);
    }
  };

  socket.onerror = (error) => {
    console.error("[WebSocket Error]:", error);
  };

  socket.onclose = (event) => {
    console.log(
      `[WebSocket Closed] Code: ${event.code}, Reason: ${event.reason}`
    );
    socket = null;
  };

  return socket;
}
