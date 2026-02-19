"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardShell({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const displayName = (user as any)?.name || "User";
    const displayEmail = (user as any)?.email || "";
    const displayRole = (user as any)?.role || "user";
    const avatar = (user as any)?.avatar || "";

    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, [user, router]);
    return (
        <div className="min-h-screen flex flex-col">
            <div className="absolute inset-0 -z-10 overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-200 blur-3xl" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200 blur-3xl" />
            </div>
            <div className="flex flex-1">
                {/* Desktop Sidebar */}
                <Sidebar
                    className="hidden md:flex"
                    user={{ name: displayName, email: displayEmail, avatar }}
                    onLogout={logout}
                />

                {/* Mobile Header */}
                <MobileHeader
                    isOpen={isMobileMenuOpen}
                    onToggle={() => setIsMobileMenuOpen((v) => !v)}
                />

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-300 z-30 md:hidden p-4">
                        <Sidebar
                            variant="mobile"
                            user={{ name: displayName, role: displayRole, avatar }}
                            onLogout={logout}
                            onNavigate={() => setIsMobileMenuOpen(false)}
                        />
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
