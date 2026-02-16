"use client";

import clsx from "clsx";

export default function SidebarItem({ icon, label, active, badge, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition",
                active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
            )}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
            </div>

            {badge && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
}
