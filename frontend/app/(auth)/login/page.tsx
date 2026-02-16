// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// (optional) If you want icons like the example:
// import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    // keep your original auth logic
    const { login, user, isLoading } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isLoading && user) {
            router.push("/dashboard");
        }
    }, [user, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        console.log(username, password);
        try {
            await login(username, password);
        } catch {
            setError("Error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-200 blur-3xl" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200 blur-3xl" />
            </div>

            {/* Back button (optional) */}
            {/* <button
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors z-10 font-medium"
      >
        <ArrowLeft size={20} />
        Back to Home
      </button> */}

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative z-10">
                {/* Header */}
                <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-blue-600/20">
                        IM
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Divider like the sample */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400">
                                Or sign in with username
                            </span>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                email address
                            </label>
                            <input
                                type="text"
                                placeholder="your@email.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 rounded-lg font-medium transition
                         bg-slate-900 text-white hover:bg-slate-800
                         focus:outline-none focus:ring-2 focus:ring-slate-900/20
                         disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-blue-600 hover:text-blue-700"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
