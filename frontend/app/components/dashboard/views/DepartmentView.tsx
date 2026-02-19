"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import IssueCard from "../IssueCard";
import StatusColumn from "../StatusColumn";

type BackendRole = "ADMIN" | "DEPARTMENT_STAFF" | "USER";

type Me = {
    id: string;
    role: BackendRole;
};

type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
type IssuePriority = "LOW" | "MEDIUM" | "HIGH";

type Issue = {
    id: string;
    title: string;
    description: string;
    status: IssueStatus;
    priority?: IssuePriority;
    department_id: string;
    reported_by: string; // user id
    created_at: string;
};

type UserLite = { id: string; full_name?: string; username?: string; email: string };

export default function DepartmentView({ me }: { me: Me }) {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [users, setUsers] = useState<UserLite[]>([]);
    const [departmentId, setDepartmentId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            // Fetch department assignment for this user
            try {
                const staffRes = await api.get(`/api/v1/department-staff/user/${me.id}`);
                if (staffRes.data && staffRes.data.length > 0) {
                    setDepartmentId(staffRes.data[0].department_id);
                }
            } catch (err) {
                console.error("Failed to fetch department assignment:", err);
            }

            const [issuesRes, usersRes] = await Promise.all([
                api.get("/api/v1/issues/"),
                api.get("/api/v1/users/"),
            ]);

            setIssues(issuesRes.data);
            setUsers(usersRes.data);
        })().catch(async (e) => {
            try {
                const issuesRes = await api.get("/api/v1/issues/");
                setIssues(issuesRes.data);
            } catch (err) {
                console.error(err);
            }
            console.error(e);
        });
    }, [me.id]);

    const deptIssues = useMemo(() => {

        if (!departmentId) return [];
        return issues.filter((i) => i.department_id === departmentId);
    }, [issues, departmentId]);
    console.log("Department Issues:", deptIssues);

    const openIssues = deptIssues.filter((i) => i.status === "OPEN");
    const inProgressIssues = deptIssues.filter((i) => i.status === "IN_PROGRESS");
    const resolvedIssues = deptIssues.filter((i) => i.status === "RESOLVED");

    const getReporterName = (userId: string) => {
        const u = users.find((x) => x.id === userId);
        return u?.full_name || u?.username || u?.email || "Unknown User";
    };

    const updateStatus = async (issueId: string, status: IssueStatus) => {
        const snapshot = issues;
        setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status } : i)));

        try {
            // Your backend has PUT /issues/{issue_id} — use that.
            // If your update schema expects more fields, adjust body accordingly.
            await api.put(`/api/v1/issues/${issueId}`, { status });
        } catch (e) {
            setIssues(snapshot);
            console.error(e);
        }
    };

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Department Dashboard</h1>
                <p className="text-gray-600">Manage and track incoming issues</p>
            </div>

            <div className="flex-1 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto pb-4">
                <div className="flex flex-col md:flex-row gap-6 h-auto md:h-full md:min-w-225">
                    <StatusColumn
                        title="Open"
                        count={openIssues.length}
                        bgColor="bg-blue-50"
                        icon={<AlertCircle className="text-blue-500" size={20} />}
                    >
                        {openIssues.map((issue) => (
                            <IssueCard
                                key={issue.id}
                                issue={issue}
                                reporterName={getReporterName(issue.reported_by)}
                                onStatusChange={updateStatus}
                            />
                        ))}
                    </StatusColumn>

                    <StatusColumn
                        title="In Progress"
                        count={inProgressIssues.length}
                        bgColor="bg-amber-50"
                        icon={<Clock className="text-amber-500" size={20} />}
                    >
                        {inProgressIssues.map((issue) => (
                            <IssueCard
                                key={issue.id}
                                issue={issue}
                                reporterName={getReporterName(issue.reported_by)}
                                onStatusChange={updateStatus}
                            />
                        ))}
                    </StatusColumn>

                    <StatusColumn
                        title="Resolved"
                        count={resolvedIssues.length}
                        bgColor="bg-emerald-50"
                        icon={<CheckCircle2 className="text-emerald-500" size={20} />}
                    >
                        {resolvedIssues.map((issue) => (
                            <IssueCard
                                key={issue.id}
                                issue={issue}
                                reporterName={getReporterName(issue.reported_by)}
                                onStatusChange={updateStatus}
                            />
                        ))}
                    </StatusColumn>
                </div>
            </div>
        </div>
    );
}


