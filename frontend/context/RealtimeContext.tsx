"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/context/AuthContext";

type RealtimeContextType = {
  isConnected: boolean;
  lastMessage: any;
  newIssues: any[];
  newUsers: any[];
  newDepartments: any[];
  issueUpdates: any[];
  clearNotifications: () => void;
};

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  // Check if backend is available before connecting WebSocket
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/health`;
        console.log("Checking backend availability at:", backendUrl);
        const response = await fetch(backendUrl);
        if (response.ok) {
          console.log("Backend is available!");
          setIsBackendAvailable(true);
        } else {
          console.log("Backend responded with:", response.status);
        }
      } catch (error) {
        console.log("Backend not available yet, retrying...", error);
        setTimeout(checkBackend, 2000);
      }
    };

    checkBackend();
  }, []);

  const { user } = useAuth();

  const { isConnected, lastMessage } = useWebSocket(
    isBackendAvailable ? `${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000"}/ws` : "",
    user?.id,
    user?.department_id
  );

  useEffect(() => {
    const wsUrl = isBackendAvailable ? `${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000"}/ws` : "";
    console.log(`RealtimeContext: WebSocket URL set to: ${wsUrl || "empty"} (Backend available: ${isBackendAvailable})`);
    console.log("RealtimeContext: User Identification:", { userId: user?.id, departmentId: user?.department_id });
  }, [isBackendAvailable, user?.id, user?.department_id]);

  const [newIssues, setNewIssues] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [newDepartments, setNewDepartments] = useState<any[]>([]);
  const [issueUpdates, setIssueUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!lastMessage) return;

    console.log("RealtimeContext: Received message:", lastMessage.type, lastMessage.data);
    switch (lastMessage.type) {
      case "new_issue":
        console.log("New issue received:", lastMessage.data.title);
        setNewIssues((prev) => [lastMessage.data, ...prev.slice(0, 9)]);
        break;
      case "issue_updated":
        console.log("Issue updated:", lastMessage.data.title);
        setIssueUpdates((prev) => [lastMessage.data, ...prev.slice(0, 9)]);
        break;
      case "new_user":
        setNewUsers((prev) => [lastMessage.data, ...prev.slice(0, 9)]);
        break;
      case "new_department":
        setNewDepartments((prev) => [lastMessage.data, ...prev.slice(0, 9)]);
        break;
      case "message":
        console.log("Received simple message:", lastMessage.data);
        // Don't show connection messages in notifications
        break;
      default:
        console.log("Unknown message type:", lastMessage.type);
    }
  }, [lastMessage]);

  const clearNotifications = () => {
    setNewIssues([]);
    setNewUsers([]);
    setNewDepartments([]);
    setIssueUpdates([]);
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        lastMessage,
        newIssues,
        newUsers,
        newDepartments,
        issueUpdates,
        clearNotifications,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
