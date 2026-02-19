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
                    ? "flex-col w-64 bg-white border-r border-gray-300"
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
                {/* <SidebarItem
                    icon={<Bell size={20} />}
                    label="Notifications"
                    badge="3"
                    onClick={onNavigate}
                />
                <SidebarItem
                    icon={<Settings size={20} />}
                    label="Settings"
                    onClick={onNavigate}
                /> */}
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
