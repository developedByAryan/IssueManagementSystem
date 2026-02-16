"use client";

import DashboardShell from "@/app/components/dashboard/DashboardShell";
import RoleBasedDashboard from "@/app/components/dashboard/RoleBasedDashboard";

export default function DashboardPage() {
    return (
        <DashboardShell>
            <RoleBasedDashboard />
        </DashboardShell>
    );
}
