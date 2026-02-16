"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Clock, AlertCircle, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";

type BackendRole = "ADMIN" | "DEPARTMENT_STAFF" | "USER";

type Me = {
    id: string;
    role: BackendRole;
    department_id?: string | null;
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

    useEffect(() => {
        (async () => {
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
    }, []);

    const deptIssues = useMemo(() => {

        if (!me.department_id) return [];
        return issues.filter((i) => i.department_id === me.department_id);
    }, [issues, me.department_id]);
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
        <div className="p-4 sm:p-6 h-full overflow-hidden flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Department Dashboard</h1>
                <p className="text-slate-500">Manage and track incoming issues</p>
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

function StatusColumn({ title, count, bgColor, icon, children }: any) {
    return (
        <div className="flex-1 flex flex-col h-auto md:h-full bg-slate-50/50 rounded-xl border border-slate-200">
            <div className={`p-4 border-b border-slate-200 flex items-center justify-between rounded-t-xl ${bgColor}`}>
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                    {icon}
                    {title}
                </div>
                <span className="bg-white text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm border border-slate-100">
                    {count}
                </span>
            </div>
            <div className="p-3 flex-1 overflow-visible md:overflow-y-auto space-y-3">
                <AnimatePresence mode="popLayout">{children}</AnimatePresence>
                {count === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm italic">No issues here</div>
                )}
            </div>
        </div>
    );
}

function IssueCard({
    issue,
    reporterName,
    onStatusChange,
}: {
    issue: any;
    reporterName: string;
    onStatusChange: (id: string, s: "OPEN" | "IN_PROGRESS" | "RESOLVED") => void;
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all group"
        >
            <h4 className="font-medium text-slate-900 line-clamp-2 mb-2">{issue.title}</h4>
            <p className="text-xs text-slate-500 mb-3 line-clamp-3">{issue.description}</p>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                <UserIcon size={12} />
                <span>{reporterName}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(issue.created_at))} ago</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
                {issue.status !== "OPEN" && (
                    <button
                        onClick={() => onStatusChange(issue.id, "OPEN")}
                        className="flex-1 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                    >
                        Open
                    </button>
                )}
                {issue.status !== "IN_PROGRESS" && (
                    <button
                        onClick={() => onStatusChange(issue.id, "IN_PROGRESS")}
                        className="flex-1 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                    >
                        In Progress
                    </button>
                )}
                {issue.status !== "RESOLVED" && (
                    <button
                        onClick={() => onStatusChange(issue.id, "RESOLVED")}
                        className="flex-1 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                    >
                        Resolve
                    </button>
                )}
            </div>
        </motion.div>
    );
}
