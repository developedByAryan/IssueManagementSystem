"use client";

import { useEffect, useState } from "react";
import { useRealtime } from "@/context/RealtimeContext";
import { Bell, RefreshCw, AlertCircle, CheckCircle, Users, Building } from "lucide-react";

export default function LiveUpdates() {
  const { isConnected, newIssues, newUsers, newDepartments, issueUpdates, clearNotifications } = useRealtime();
  const [showNotifications, setShowNotifications] = useState(false);

  const totalNotifications = newIssues.length + newUsers.length + newDepartments.length + issueUpdates.length;

  const getConnectionStatus = () => {
    if (isConnected) return { text: 'Connected', color: 'bg-green-500' };
    return { text: 'Connecting...', color: 'bg-yellow-500' };
  };

  const connectionStatus = getConnectionStatus();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_issue":
        return <AlertCircle className="text-blue-500" size={16} />;
      case "issue_updated":
        return <CheckCircle className="text-green-500" size={16} />;
      case "new_user":
        return <Users className="text-purple-500" size={16} />;
      case "new_department":
        return <Building className="text-orange-500" size={16} />;
      default:
        return <Bell className="text-gray-500" size={16} />;
    }
  };

  const allNotifications = [
    ...newIssues.map(item => ({ ...item, type: "new_issue" })),
    ...issueUpdates.map(item => ({ ...item, type: "issue_updated" })),
    ...newUsers.map(item => ({ ...item, type: "new_user" })),
    ...newDepartments.map(item => ({ ...item, type: "new_department" })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${connectionStatus.color}`}></span>
          Real-time Updates ({connectionStatus.text})
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell size={18} />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalNotifications}
              </span>
            )}
          </button>

          {totalNotifications > 0 && (
            <button
              onClick={clearNotifications}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Clear notifications"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {showNotifications && totalNotifications > 0 && (
        <div className="mb-4 max-h-60 overflow-y-auto space-y-2">
          {allNotifications.map((notification, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {notification.type === 'new_issue' && `New issue: ${notification.title || 'Untitled'}`}
                  {notification.type === 'issue_updated' && `Issue updated: ${notification.title || 'Untitled'}`}
                  {notification.type === 'new_user' && `New user: ${notification.full_name || notification.username || notification.email}`}
                  {notification.type === 'new_department' && `New department: ${notification.name}`}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{newIssues.length}</div>
            <div className="text-xs text-slate-600">New Issues</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{issueUpdates.length}</div>
            <div className="text-xs text-slate-600">Updates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{newUsers.length}</div>
            <div className="text-xs text-slate-600">New Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{newDepartments.length}</div>
            <div className="text-xs text-slate-600">New Depts</div>
          </div>
        </div>

        {totalNotifications === 0 && (
          <p className="text-center text-slate-500 text-sm mt-4 italic">
            No new notifications...
          </p>
        )}
      </div>
    </div>
  );
}
