"use client";

import { Menu, X } from "lucide-react";

export default function MobileHeader({ isOpen, onToggle }: any) {
    return (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-300 flex items-center justify-between px-4 z-20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold">
                    IM
                </div>
                <span className="font-bold text-lg">
                    IssueManager
                </span>
            </div>

            <button onClick={onToggle}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
    );
}
