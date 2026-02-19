"use client";

import clsx from "clsx";

export default function SidebarItem({ icon, label, active, badge, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium mb-1",
                active
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700"
            )}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
            </div>

            {badge && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                    {badge}
                </span>
            )}
        </button>
    );
}
