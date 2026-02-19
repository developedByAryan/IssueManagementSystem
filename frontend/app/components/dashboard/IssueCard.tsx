import React from 'react'
import { motion } from "motion/react"
import { User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

const IssueCard = ({
    issue,
    reporterName,
    onStatusChange,
}: {
    issue: any;
    reporterName: string;
    onStatusChange: (id: string, s: "OPEN" | "IN_PROGRESS" | "RESOLVED") => void;
}) => {
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

export default IssueCard