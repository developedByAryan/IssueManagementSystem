"use client";

import { LayoutDashboard, Settings, Bell, LogOut } from "lucide-react";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";

export default function Sidebar({
    className,
    variant = "desktop",
    user,
    onLogout,
    onNavigate,
}: any) {
    const isDesktop = variant === "desktop";

    return (
        <aside
            className={clsx(
                isDesktop
                    ? "flex-col w-64 bg-white border-r border-slate-200"
                    : "w-full",
                className
            )}
        >
            {isDesktop && (
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            IM
                        </div>
                        <span className="font-bold text-xl text-slate-800">
                            IssueManager
                        </span>
                    </div>
                </div>
            )}

            <div className={clsx(isDesktop ? "p-4 flex-1 space-y-2" : "space-y-2")}>
                <SidebarItem
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    active
                    onClick={onNavigate}
                />
                <SidebarItem
                    icon={<Bell size={20} />}
                    label="Notifications"
                    badge="3"
                    onClick={onNavigate}
                />
                <SidebarItem
                    icon={<Settings size={20} />}
                    label="Settings"
                    onClick={onNavigate}
                />
            </div>

            {/* User section */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            className="w-8 h-8 rounded-full bg-slate-200 object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                            {user.name?.[0]}
                        </div>
                    )}

                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                            {user.name}
                        </p>
                        {user.email && (
                            <p className="text-xs text-slate-500">{user.email}</p>
                        )}
                    </div>

                    <button onClick={onLogout}>
                        <LogOut size={16} className="text-slate-400 hover:text-red-500" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
