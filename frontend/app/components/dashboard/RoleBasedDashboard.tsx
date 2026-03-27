"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminView from "@/app/components/dashboard/views/AdminView";
import DepartmentView from "@/app/components/dashboard/views/DepartmentView";
import UserView from "@/app/components/dashboard/views/UserView";

type BackendRole = "ADMIN" | "DEPARTMENT_STAFF" | "USER";

type Me = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role: BackendRole;
  department_id?: string | null;
  avatar?: string | null;
};

export default function RoleBasedDashboard() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get("/api/v1/users/me");
      setMe(res.data);
    })()
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!me) return <div className="p-6 text-gray-600">Please login.</div>;

  if (me.role === "ADMIN") return <AdminView me={me} />;
  if (me.role === "DEPARTMENT_STAFF") return <DepartmentView me={me} />;
  return <UserView me={me} />;
}
