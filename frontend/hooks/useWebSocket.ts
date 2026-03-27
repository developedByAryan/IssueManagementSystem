"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type WebSocketMessage = {
  type: string;
  data: any;
  timestamp: string;
};

type UseWebSocketReturn = {
  isConnected: boolean;
  messages: WebSocketMessage[];
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: string) => void;
  clearMessages: () => void;
};

export function useWebSocket(
  url: string,
  userId?: string,
  departmentId?: string
): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!url) {
      console.log("WebSocket URL is empty, skipping connection");
      return;
    }

    try {
      const wsUrl = new URL(url);
      if (userId) {
        wsUrl.searchParams.append("user_id", userId);
        console.log("useWebSocket: Appending user_id:", userId);
      }
      if (departmentId) {
        wsUrl.searchParams.append("department_id", departmentId);
        console.log("useWebSocket: Appending department_id:", departmentId);
      }

      console.log("useWebSocket: Attempting connection to:", wsUrl.toString());

      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(wsUrl.toString());

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected successfully");
      };

      ws.current.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);

        try {
          // Try to parse as JSON first
          const message: WebSocketMessage = JSON.parse(event.data);
          setMessages((prev) => [...prev, message]);
          setLastMessage(message);
        } catch (error) {
          console.log("Non-JSON message, treating as simple message");
          // Handle simple text messages
          setMessages((prev) => [...prev, {
            type: "message",
            data: event.data,
            timestamp: new Date().toISOString()
          }]);
          setLastMessage({
            type: "message",
            data: event.data,
            timestamp: new Date().toISOString()
          });
        }
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        console.log("WebSocket disconnected:", event.code, event.reason);

        // Simple reconnection logic
        if (event.code !== 1000) {
          setTimeout(() => {
            console.log("Attempting to reconnect WebSocket...");
            connect();
          }, 3000);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setIsConnected(false);
    }
  }, [url, userId, departmentId]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  return {
    isConnected,
    messages,
    lastMessage,
    sendMessage,
    clearMessages,
  };
}
