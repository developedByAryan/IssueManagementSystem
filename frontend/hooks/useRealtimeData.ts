"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRealtime } from "@/context/RealtimeContext";
import api from "@/lib/api";

type UseRealtimeDataOptions = {
  onNewIssue?: () => void;
  onIssueUpdate?: () => void;
  onNewUser?: () => void;
  onNewDepartment?: () => void;
};

export function useRealtimeData(options: UseRealtimeDataOptions = {}) {
  const { lastMessage } = useRealtime();
  const processedMessageRef = useRef<any>(null);

  const handleRealtimeEvent = useCallback(() => {
    // Only process if it's a new message reference
    if (lastMessage && lastMessage !== processedMessageRef.current) {
      processedMessageRef.current = lastMessage;
      
      switch (lastMessage.type) {
        case "new_issue":
          options.onNewIssue?.();
          break;
        case "issue_updated":
          options.onIssueUpdate?.();
          break;
        case "new_user":
          options.onNewUser?.();
          break;
        case "new_department":
          options.onNewDepartment?.();
          break;
      }
    }
  }, [lastMessage, options]);

  useEffect(() => {
    handleRealtimeEvent();
  }, [handleRealtimeEvent]);
}

// Specific hooks for different data types
export function useRealtimeIssues(refreshCallback: () => void) {
  useRealtimeData({
    onNewIssue: refreshCallback,
    onIssueUpdate: refreshCallback,
  });
}

export function useRealtimeUsers(refreshCallback: () => void) {
  useRealtimeData({
    onNewUser: refreshCallback,
  });
}

export function useRealtimeDepartments(refreshCallback: () => void) {
  useRealtimeData({
    onNewDepartment: refreshCallback,
  });
}
