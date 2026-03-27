"use client";

import { useState } from "react";
import { LayoutDashboard, Settings, Bell, LogOut, RefreshCw, CheckCircle2 } from "lucide-react";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";
import { useRealtime } from "@/context/RealtimeContext";

export default function Sidebar({
    className,
    variant = "desktop",
    user,
    onLogout,
    onNavigate,
}: any) {
    const isDesktop = variant === "desktop";
    const [showNotifications, setShowNotifications] = useState(false);
    
    // Safely consume context since Sidebar is rendered within DashboardShell -> RealtimeProvider
    const { newIssues, issueUpdates, clearNotifications } = useRealtime();

    const allNotifications = [
        ...newIssues.map((item: any) => ({ ...item, type: "new_issue" })),
        ...issueUpdates.map((item: any) => ({ ...item, type: "issue_updated" })),
    ].sort((a, b) => new Date(b.timestamp || b.created_at || new Date()).getTime() - new Date(a.timestamp || a.created_at || new Date()).getTime());

    return (
        <aside
            className={clsx(
                isDesktop
                    ? "flex-col w-64 bg-white border-r border-gray-300 h-[100vh] sticky top-0"
                    : "w-full",
                className
            )}
        >
            {isDesktop && (
                <div className="p-6 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-xl">
                            Issue Manager
                        </span>
                    </div>
                </div>
            )}

            <div className={clsx(isDesktop ? "p-4 flex-1" : "")}>
                <SidebarItem
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    active
                    onClick={onNavigate}
                />
                
                <div className="relative">
                    <SidebarItem
                        icon={<Bell size={20} />}
                        label="Notifications"
                        badge={allNotifications.length > 0 ? allNotifications.length.toString() : undefined}
                        onClick={() => setShowNotifications(!showNotifications)}
                    />
                    
                    {showNotifications && (
                        <div className={clsx(
                            "absolute z-50 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden flex flex-col",
                            isDesktop ? "left-full ml-4 top-0 w-80" : "left-4 right-4 top-12"
                        )}>
                            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <span className="font-semibold text-sm text-gray-700">Notifications</span>
                                {allNotifications.length > 0 && (
                                    <button 
                                        onClick={() => {
                                            clearNotifications();
                                            setShowNotifications(false);
                                        }} 
                                        className="text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-gray-200" 
                                        title="Clear All"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {allNotifications.length === 0 ? (
                                    <div className="p-4 text-sm text-gray-500 text-center italic">No new notifications</div>
                                ) : (
                                    allNotifications.map((notification: any, i: number) => (
                                        <div key={i} className="p-3 border-b border-gray-50 hover:bg-gray-50 flex items-start gap-3">
                                            <CheckCircle2 size={16} className={clsx("mt-0.5 shrink-0", notification.type === "new_issue" ? "text-blue-500" : "text-green-500")} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {notification.type === "new_issue" ? "New issue created:" : "Status updated:"}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate max-w-[200px]">{notification.title || 'Untitled Issue'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={clsx(
                                                        "text-xs font-semibold px-1.5 py-0.5 rounded-md", 
                                                        notification.type === "new_issue" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                                                    )}>
                                                        {notification.status || "Updated"}
                                                    </span>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(notification.timestamp || notification.created_at || new Date()).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User section */}
            <div className="p-4 border-t border-gray-300">
                <div className="flex items-center gap-3">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            className="w-8 h-8 bg-gray-200 object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
                            {user.name?.[0]}
                        </div>
                    )}

                    <div className="flex-1">
                        <p className="text-sm font-medium">
                            {user.name}
                        </p>
                        {user.email && (
                            <p className="text-xs text-gray-500">{user.email}</p>
                        )}
                    </div>

                    <button onClick={onLogout}>
                        <LogOut size={16} className="text-gray-500 hover:text-red-400 transition-colors" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
