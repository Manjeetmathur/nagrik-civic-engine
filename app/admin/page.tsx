'use client';

import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);
        await new Promise(resolve => setTimeout(resolve, 800));
        const user: User = { name: 'Admin User', email: email, role: 'admin' };
        localStorage.setItem('nagar_user', JSON.stringify(user));
        router.push('/admin/dashboard');
        setError(true);
        setIsLoading(false);
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/')}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Citizen Portal</span>
                </button>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl shadow-slate-300/50 p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl text-white mb-4 shadow-lg shadow-blue-500/30">
                            <ShieldAlert size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Admin Access</h1>
                        <p className="text-base text-slate-600">Sign in to the Nagrik Civic Dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-3 text-rose-700">
                                <ShieldAlert size={18} className="shrink-0" />
                                <p className="text-sm font-semibold">Invalid email or password. Please try again.</p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="admin@nagrik.gov"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="shadcn-input w-full pl-12 pr-4 py-3 text-base"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="shadcn-input w-full pl-12 pr-12 py-3 text-base"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <ShieldAlert size={18} />
                                    Sign In to Dashboard
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-xs text-center text-slate-500">
                            Secure access to municipal operations and civic monitoring
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
