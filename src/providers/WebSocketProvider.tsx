'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '@/context/WebSocketContext';
import { connectWebSocket } from '@/api/websocket';
import { fetchAuthSession } from 'aws-amplify/auth';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/types/notification';

type Props = {
  children: React.ReactNode;
};

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);

  /** Retry logic to wait until Cognito session is ready */
  const getUserSubWithRetry = async (maxAttempts = 10, delay = 300): Promise<string | null> => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (idToken) {
          const payload = JSON.parse(atob(idToken.split('.')[1]));
          const sub = payload.sub;
          if (sub) return sub;
        }
      } catch (err) {
        console.warn(`[WebSocket] Attempt ${i + 1} failed`);
      }
      await new Promise((res) => setTimeout(res, delay));
    }

    console.error("[WebSocket] Failed to get userId after retries");
    return null;
  };

  useEffect(() => {
    const init = async () => {
      const userId = await getUserSubWithRetry();
      if (!userId) return;

      console.log(`[WebSocket] Connecting with userId: ${userId}`);
      const ws = connectWebSocket(userId, (data: Notification) => {
        console.log('[WebSocket] Message received:', data);

        // Push into Zustand
        useNotifications.getState().addNotification(data);

        // Show toast
        if (data.title || data.content) {
          toast(data.title || 'Notification', {
            description: data.content,
            duration: Infinity,
            dismissible: true,
            closeButton: true,
            action: data.route
              ? {
                  label: 'View',
                  onClick: () => {
                    window.location.href = data.route!;
                  },
                }
              : undefined,
          });
        }
      });

      setSocket(ws);

      // Keep connection alive with ping
      pingInterval.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'ping' }));
          console.log('[WebSocket] Ping sent');
        }
      }, 270_000); // every 4.5 minutes
    };

    init();

    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current);
      socket?.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};
