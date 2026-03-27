"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Shield, User, Briefcase, Search, Plus, History } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useRealtimeUsers, useRealtimeDepartments } from "@/hooks/useRealtimeData";

type Role = "ADMIN" | "DEPARTMENT_STAFF" | "USER";
type BackendRole = Role;

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
    avatar?: string | null;
};

type Department = {
    id: string;
    name: string;
    description: string
};

export default function AdminView({ me }: { me: Me }) {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [departmentStaff, setDepartmentStaff] = useState<Map<string, string>>(new Map());
    const router = useRouter();

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [departmentSelecting, setDepartmentSelecting] = useState<Set<string>>(new Set());
    const [selectedDept, setSelectedDept] = useState<Map<string, string>>(new Map());

    const fetchUsers = async () => {
        try {
            const res = await api.get("/api/v1/users/");
            setUsers(res.data);

            try {
                const staffRes = await api.get("/api/v1/department-staff/");
                const staffMap = new Map<string, string>();
                staffRes.data.forEach((staff: any) => {
                    staffMap.set(staff.user_id, staff.department_id);
                });
                setDepartmentStaff(staffMap);
            } catch (err) {
                console.error("Failed to fetch department staff:", err);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get("/api/v1/departments/");
            setDepartments(res.data);
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        }
    };


    useRealtimeUsers(fetchUsers);
    useRealtimeDepartments(fetchDepartments);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchUsers();
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

    const patchUserRole = async (userId: string, role: Role, departmentId: string | null = null) => {
        const payload: { role: Role; department_id: string | null } = {
            role,
            department_id: departmentId,
        };

        await api.patch(`/api/v1/users/${userId}/role`, payload);

        setUsers((prev) =>
            prev.map((u) =>
                u.id === userId ? { ...u, role } : u
            )
        );

        if (role === "DEPARTMENT_STAFF" && departmentId) {
            setDepartmentStaff((prev) => new Map(prev).set(userId, departmentId));
        } else if (role !== "DEPARTMENT_STAFF") {
            setDepartmentStaff((prev) => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
            });
        }

        setDepartmentSelecting((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
        setSelectedDept((prev) => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
        });
    };

    const handleRoleChange = async (user: AppUser, newRole: Role) => {
        if (newRole === "DEPARTMENT_STAFF") {
            try {
                await patchUserRole(user.id, "DEPARTMENT_STAFF", null);
                setDepartmentSelecting((prev) => new Set(prev).add(user.id));
                toast.success("Role updated to Department Staff");
            } catch (e: any) {
                toast.error(toErrorMessage(e));
            }
            return;
        }

        try {
            await patchUserRole(user.id, newRole, null);
            toast.success("User role updated");
        } catch (e: any) {
            toast.error(toErrorMessage(e));
        }
    };

    const handleDepartmentChange = async (user: AppUser, departmentId: string) => {
        if (!departmentId) {
            toast.error("Select a department");
            return;
        }

        try {
            await patchUserRole(user.id, "DEPARTMENT_STAFF", departmentId);
            toast.success("Department updated");
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
    const deleteDepartment = async (id: string) => {
        const snapshot = departments;
        setDepartments((prev) => prev.filter((d) => d.id !== id));

        try {
            await api.delete(`/api/v1/departments/${id}`);
            toast.success("Department deleted");
        } catch (e: any) {
            setDepartments(snapshot);
            toast.error(toErrorMessage(e));
        }
    };

    const badgeStyle = (role: BackendRole) =>
        clsx(
            "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium border",
            role === "ADMIN"
                ? "bg-red-50 text-red-700 border-red-300"
                : role === "DEPARTMENT_STAFF"
                    ? "bg-purple-50 text-purple-700 border-purple-300"
                    : "bg-blue-50 text-blue-700 border-blue-300"
        );


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.description) return;

        try {
            const res = await api.post("/api/v1/departments/", {
                name: formData.name,
                description: formData.description,
            });
            const created = res.data;
            if (created?.id) setDepartments((prev) => [created, ...prev]);

            setFormData({ name: "", description: "" });
            setShowForm(false);
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-gray-600">Manage user access</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-gray-300 w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-300 mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="px-6 py-3 text-xs font-semibold uppercase">User</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase">Role</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr
                                    key={u.id}
                                    className="border-b border-gray-200"
                                >
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            {u.avatar ? (
                                                <img src={u.avatar} alt={u.email} className="w-10 h-10 bg-gray-200 object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 flex items-center justify-center font-semibold">
                                                    {(u.full_name || u.username || u.email)[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">{u.full_name || u.username || "Unknown"}</div>
                                                <div className="text-sm text-gray-600">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-3">
                                        <span className={badgeStyle(u.role)}>
                                            {u.role === "ADMIN" && <Shield size={12} />}
                                            {u.role === "DEPARTMENT_STAFF" && <Briefcase size={12} />}
                                            {u.role === "USER" && <User size={12} />}
                                            <span className="capitalize">
                                                {u.role === "DEPARTMENT_STAFF" ? "department staff" : u.role.toLowerCase()}
                                            </span>
                                        </span>
                                    </td>

                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                                                disabled={u.id === me.id}
                                                className="text-sm border border-gray-300 px-2 py-1"
                                            >
                                                <option value="USER">User</option>
                                                <option value="DEPARTMENT_STAFF">Department Staff</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>

                                            {(u.role === "DEPARTMENT_STAFF" || departmentSelecting.has(u.id)) && (
                                                <select
                                                    value={selectedDept.get(u.id) || departmentStaff.get(u.id) || ""}
                                                    onChange={(e) => {
                                                        setSelectedDept((prev) => new Map(prev).set(u.id, e.target.value));
                                                        handleDepartmentChange(u, e.target.value);
                                                    }}
                                                    className="text-sm border border-gray-300 px-2 py-1"
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
                                                    className="p-1.5 text-gray-500"
                                                    title="Remove User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
                    <p className="text-slate-500 mt-1">Manage Departments</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
                >
                    {showForm ? "Cancel" : <><Plus size={18} /> Create</>}
                </button>
            </div>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                >
                    <h2 className="text-lg font-semibold mb-4">New Department</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Department Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Devops"
                                className="w-full px-3 py-2 border border-gray-300"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>


                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                rows={4}
                                placeholder="Describe the department in detail..."
                                className="w-full px-3 py-2 border border-gray-300 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                Create Department
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
            <div>
                {departments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-100 border-2 border-gray-300">
                        <History className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium">No departments</h3>
                        <p className="text-gray-600">You haven't created any departments yet.</p>
                    </div>
                ) : (
                    departments.map((department) => {
                        return (
                            <div
                                key={department.id}
                                className="bg-white border border-gray-300 p-5 mb-3"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">

                                        <h3 className="text-lg font-semibold">{department.name}</h3>
                                        <p className="text-gray-600 text-sm">{department.description}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteDepartment(department.id)}
                                    className="p-1.5 text-gray-500 mt-2 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Remove Department"
                                >
                                    <Trash2 size={16} />

                                </button>

                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
