"use client";

import DashboardShell from "@/app/components/dashboard/DashboardShell";
import RoleBasedDashboard from "@/app/components/dashboard/RoleBasedDashboard";
import { RealtimeProvider } from "@/context/RealtimeContext";

export default function DashboardPage() {
    return (
        <RealtimeProvider>
            <DashboardShell>
                <RoleBasedDashboard />
            </DashboardShell>
        </RealtimeProvider>
    );
}
