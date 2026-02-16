// app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const { register } = useAuth(); // <--- Hook into our context
    const [email, setEmail] = useState("");
    const [fullname, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.push("/dashboard");
        }
    }, [user, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        try {
            console.log("Registering user...")
            await register(fullname, email, password);
        } catch (err: any) {
            const detail = err?.response?.data?.detail;

            // FastAPI validation error: detail is usually an array of { msg, ... }
            if (Array.isArray(detail)) {
                setError(detail.map((e) => e.msg).join(", "));
            } else if (typeof detail === "string") {
                setError(detail);
            } else {
                setError("Registration failed");
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
                    Create an Account
                </h2>

                {error && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={fullname}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 text-neutral-800
               py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-neutral-900
               shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 text-neutral-800
               py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white
             hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Register
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}