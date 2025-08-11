'use client';

import { createContext, useContext } from 'react';

/** Message shape expected from WebSocket server */
/** Context structure */
type WebSocketContextType = {
  socket: WebSocket | null;
};

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
});

export const useWebSocket = () => useContext(WebSocketContext);
