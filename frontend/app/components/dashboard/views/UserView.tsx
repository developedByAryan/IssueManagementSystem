"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
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
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "in_progress":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "resolved":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Issues</h1>
                    <p className="text-slate-500 mt-1">Report and track your maintenance requests</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
                >
                    {showForm ? "Cancel" : <><Plus size={18} /> Report Issue</>}
                </button>
            </div>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                >
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">New Issue Report</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Broken Printer 3rd Floor"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                rows={4}
                                placeholder="Describe the issue in detail..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                Submit Report
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="space-y-4">
                {myIssues.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                        <History className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No issues reported</h3>
                        <p className="text-slate-500">You haven't reported any issues yet.</p>
                    </div>
                ) : (
                    myIssues.map((issue) => {
                        const dept = departments.find((d) => d.id === issue.department_id);
                        return (
                            <motion.div
                                key={issue.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
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
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
