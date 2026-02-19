"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";
import api from "@/lib/api";

type Me = { id: string };

type IssueStatus = "open" | "in_progress" | "resolved";
type Issue = {
    id: string;
    title: string;
    description: string;
    status: IssueStatus;
    department_id: string;
    reported_by: string;
    created_at: string;
};

type Department = {
    id: string;
    name: string;
    color?: string; // optional if backend doesn’t provide
};

export default function UserView({ me }: { me: Me }) {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: "", description: "", department_id: "" });

    useEffect(() => {
        (async () => {
            const [issuesRes, deptRes] = await Promise.all([
                api.get("/api/v1/issues/"),
                api.get("/api/v1/departments/"),
            ]);
            setIssues(issuesRes.data);
            setDepartments(deptRes.data);
        })().catch(console.error);
    }, []);

    const myIssues = useMemo(() => {
        return issues
            .filter((i) => i.reported_by === me.id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [issues, me.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.department_id) return;

        try {
            const res = await api.post("/api/v1/issues/", {
                title: formData.title,
                description: formData.description,
                department_id: formData.department_id,
                // priority: "HIGH" // optional if your schema requires
            });

            // If API returns created issue, prepend it; otherwise refetch
            const created = res.data;
            if (created?.id) setIssues((prev) => [created, ...prev]);

            setFormData({ title: "", description: "", department_id: "" });
            setShowForm(false);
        } catch (err) {
            console.error(err);
        }
    };

    const statusColor = (status: IssueStatus) => {
        switch (status) {
            case "open":
                return "bg-blue-100 text-blue-700 border-blue-300";
            case "in_progress":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "resolved":
                return "bg-green-100 text-green-700 border-green-300";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">My Issues</h1>
                    <p className="text-gray-600">Report and track your maintenance requests</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 font-medium flex items-center gap-2"
                >
                    {showForm ? "Cancel" : <><Plus size={18} /> Report Issue</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-300 p-6 mb-4">
                    <h2 className="text-lg font-semibold mb-4">New Issue Report</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Issue Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Broken Printer 3rd Floor"
                                className="w-full px-3 py-2 border border-gray-300"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Department</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300"
                                value={formData.department_id}
                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                required
                            >
                                <option value="">Select Department...</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                rows={4}
                                placeholder="Describe the issue in detail..."
                                className="w-full px-3 py-2 border border-gray-300 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 font-medium">
                                Submit Report
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div>
                {myIssues.length === 0 ? (
                    <div className="text-center py-12 bg-gray-100 border-2 border-gray-300">
                        <History className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium">No issues reported</h3>
                        <p className="text-gray-600">You haven't reported any issues yet.</p>
                    </div>
                ) : (
                    myIssues.map((issue) => {
                        const dept = departments.find((d) => d.id === issue.department_id);
                        return (
                            <div
                                key={issue.id}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider", statusColor(issue.status))}>
                                                {issue.status.replace("_", " ")}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(issue.created_at))} ago
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-slate-900 leading-tight">{issue.title}</h3>
                                        <p className="text-slate-600 text-sm">{issue.description}</p>
                                    </div>

                                    {dept && (
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 self-start">
                                            <div className={`w-2 h-2 rounded-full ${dept.color || "bg-slate-400"}`} />
                                            {dept.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
