
"use client";

import type { Notification } from "@/types/notification";

import { connectWebSocket } from "@/api/websocket";
import React, { useRef, useState, useEffect } from "react";
import { WebSocketContext } from "@/context/WebSocketContext";

import { Hub } from "aws-amplify/utils";
import { fetchAuthSession } from "aws-amplify/auth";

import { toast } from "sonner";

import { useNotifications } from "@/hooks/useNotifications";
// import { Logger } from "@/lib/utils/logger";

type Props = {
  children: React.ReactNode;
};

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);

  const getUserSub = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      if (!idToken) return null;
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      return payload.sub ?? null;
    } catch {
      // Logger.warn("[WebSocket] Auth session not ready");
      return null;
    }
  };

  const initWebSocket = async () => {
    const userId = await getUserSub();
    if (!userId) return;

    if (socket && socket.readyState === WebSocket.OPEN) return;

    // Logger.log(`[WebSocket] Connecting with userId: ${userId}`);
    const ws = connectWebSocket(userId, (data: Notification) => {
      // Logger.log("[WebSocket] Message received:", data);

      // Update Zustand
      useNotifications.getState().addNotification(data);

      // Show toast
      if (data.title || data.content) {
        toast(data.title || "Notification", {
          description: data.content,
          duration: Infinity,
          dismissible: true,
          closeButton: true,
          action: data.route
            ? {
                label: "View",
                onClick: () => {
                  window.location.href = data.route!;
                },
              }
            : undefined,
        });
      }
    });

    setSocket(ws);

    if (pingInterval.current) clearInterval(pingInterval.current);
    pingInterval.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "ping" }));
        // Logger.log("[WebSocket] Ping sent");
      }
    }, 270000);

    ws.onclose = () => {
      // Logger.warn(`[WebSocket] Closed (${event.code}). Retrying in 5s...`);
      setSocket(null);
      setTimeout(initWebSocket, 5000);
    };
  };

  useEffect(() => {
    initWebSocket();

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") {
        // Logger.log("[WebSocket] Detected sign-in → reconnecting...");
        initWebSocket();
      }
    });

    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current);
      socket?.close();
      unsubscribe(); 
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};
