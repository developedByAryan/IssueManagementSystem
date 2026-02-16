"use client";

import { ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
            router.push('/login');
        }
    }, [user, router]);
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <div className="flex flex-1 overflow-hidden relative">
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
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-30 md:hidden p-4"
                        >
                            <Sidebar
                                variant="mobile"
                                user={{ name: displayName, role: displayRole, avatar }}
                                onLogout={logout}
                                onNavigate={() => setIsMobileMenuOpen(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
