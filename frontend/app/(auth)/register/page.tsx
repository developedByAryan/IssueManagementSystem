"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const { register } = useAuth();
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
        setError("");
        try {
            console.log("Registering user...")
            await register(fullname, email, password);
        } catch (err: any) {
            const detail = err?.response?.data?.detail;

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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-200 blur-3xl" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200 blur-3xl" />
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative z-10">
                {/* Header */}
                <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Create an Account
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Sign up to get started
                    </p>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Your Name"
                                value={fullname}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter Your Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-lg font-medium transition
                                       bg-slate-900 text-white hover:bg-slate-800
                                       focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                        >
                            Register
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link
                            href="/"
                            className="font-medium text-blue-600 hover:text-blue-700"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}