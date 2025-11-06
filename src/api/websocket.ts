// src/api/websocket.ts

import type { Notification } from "@/types/notification";

import appConfig from "@/config/app-config";
import { Logger } from "@/lib/utils/logger";

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
    Logger.log("[WebSocket Connected]");
  };

  socket.onmessage = (event) => {
    try {
      const data: Notification = JSON.parse(event.data);
      Logger.log("[WebSocket Message Received]:", data);
      if (onMessage) onMessage(data);
    } catch (err) {
      Logger.warn("WebSocket message is not JSON:", event.data);
      Logger.log("Error details:", err);
    }
  };

  socket.onerror = (error) => {
    Logger.error("[WebSocket Error]:", error);
  };

  socket.onclose = (event) => {
    Logger.log(
      `[WebSocket Closed] Code: ${event.code}, Reason: ${event.reason}`
    );
    socket = null;
  };

  return socket;
}
