"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Trash2, Shield, User, Briefcase, Search } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "DEPARTMENT_STAFF" | "USER";
type BackendRole = Role;

type Me = {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    role: BackendRole;
};

type AppUser = {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    role: BackendRole;
    department_id?: string | null;
    avatar?: string | null;
};

type Department = {
    id: string;
    name: string;
};

export default function AdminView({ me }: { me: Me }) {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const router = useRouter();

    useEffect(() => {
        api.get("/api/v1/departments/").then((res) => setDepartments(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        (async () => {
            const res = await api.get("/api/v1/users/");
            setUsers(res.data);
        })().catch(console.error);
    }, []);

    const filteredUsers = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return users.filter(
            (u) =>
                (u.full_name || u.username || "").toLowerCase().includes(s) ||
                u.email.toLowerCase().includes(s)
        );
    }, [users, searchTerm]);

    function toErrorMessage(err: any): string {
        const detail = err?.response?.data?.detail;

        if (Array.isArray(detail)) {
            return detail
                .map((x: any) => {
                    const field = Array.isArray(x.loc) ? x.loc.join(".") : "body";
                    return `${field}: ${x.msg}`;
                })
                .join(" | ");
        }

        if (typeof detail === "string") return detail;
        if (detail && typeof detail === "object") return JSON.stringify(detail);

        return err?.message || "Request failed";
    }

    // This function ONLY talks to backend (no UI-only logic)
    const patchUserRole = async (userId: string, role: Role, departmentId: string | null) => {
        const payload: { role: Role; department_id: string | null } = {
            role,
            department_id: departmentId, // UUID or null
        };

        await api.patch(`/api/v1/users/${userId}/role`, payload);

        // update UI
        setUsers((prev) =>
            prev.map((u) =>
                u.id === userId ? { ...u, role, department_id: departmentId } : u
            )
        );
    };

    const handleRoleChange = async (user: AppUser, newRole: Role) => {
        // If selecting department staff, do NOT call backend yet.
        // Just update UI so the department selector appears.
        if (newRole === "DEPARTMENT_STAFF") {
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id
                        ? { ...u, role: "DEPARTMENT_STAFF", department_id: null }
                        : u
                )
            );
            return;
        }

        // Switching away from department staff: clear department_id in DB by sending null
        try {
            await patchUserRole(user.id, newRole, null);
            toast.success("User role updated");
            router.push("/dashboard");
        } catch (e: any) {
            toast.error(toErrorMessage(e));
        }
    };

    const handleDepartmentChange = async (user: AppUser, departmentId: string) => {
        // Only valid when role is already DEPARTMENT_STAFF
        if (!departmentId) {
            toast.error("Select a department");
            return;
        }

        try {
            await patchUserRole(user.id, "DEPARTMENT_STAFF", departmentId);
            toast.success("User role updated");
            router.push("/dashboard");
        } catch (e: any) {
            toast.error(toErrorMessage(e));
        }
    };

    const deleteUser = async (id: string) => {
        if (id === me.id) return;

        const snapshot = users;
        setUsers((prev) => prev.filter((u) => u.id !== id));

        try {
            await api.delete(`/api/v1/users/${id}`);
            toast.success("User deleted");
        } catch (e: any) {
            setUsers(snapshot);
            toast.error(toErrorMessage(e));
        }
    };

    const badgeStyle = (role: BackendRole) =>
        clsx(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
            role === "ADMIN"
                ? "bg-rose-50 text-rose-700 border-rose-100"
                : role === "DEPARTMENT_STAFF"
                    ? "bg-purple-50 text-purple-700 border-purple-100"
                    : "bg-blue-50 text-blue-700 border-blue-100"
        );

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500">Manage user access</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((u) => (
                                <motion.tr
                                    key={u.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {u.avatar ? (
                                                <img src={u.avatar} alt={u.email} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-700">
                                                    {(u.full_name || u.username || u.email)[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-slate-900">{u.full_name || u.username || "Unknown"}</div>
                                                <div className="text-sm text-slate-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={badgeStyle(u.role)}>
                                            {u.role === "ADMIN" && <Shield size={12} />}
                                            {u.role === "DEPARTMENT_STAFF" && <Briefcase size={12} />}
                                            {u.role === "USER" && <User size={12} />}
                                            <span className="capitalize">
                                                {u.role === "DEPARTMENT_STAFF" ? "department staff" : u.role.toLowerCase()}
                                            </span>
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                                                disabled={u.id === me.id}
                                                className="text-sm border border-slate-300 rounded px-2 py-1"
                                            >
                                                <option value="USER">User</option>
                                                <option value="DEPARTMENT_STAFF">Department Staff</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>

                                            {u.role === "DEPARTMENT_STAFF" && (
                                                <select
                                                    value={u.department_id ?? ""}
                                                    onChange={(e) => handleDepartmentChange(u, e.target.value)}
                                                    className="text-sm border border-slate-300 rounded px-2 py-1"
                                                >
                                                    <option value="">Select department</option>
                                                    {departments.map((d) => (
                                                        <option key={d.id} value={d.id}>
                                                            {d.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            {u.id !== me.id && (
                                                <button
                                                    onClick={() => deleteUser(u.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Remove User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
