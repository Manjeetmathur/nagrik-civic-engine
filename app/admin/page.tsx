'use client';

import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple demo login - store user in localStorage
        const user: User = { name: 'Admin User', email: email, role: 'admin' };
        localStorage.setItem('nagar_user', JSON.stringify(user));
        router.push('/admin/dashboard');
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-none border border-zinc-200 shadow-sm p-8">
                <div className="text-center mb-8">
                    <div className="bg-zinc-900 p-3 rounded-none text-white inline-flex mb-4">
                        <ShieldAlert size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Admin Login</h2>
                    <p className="text-sm text-zinc-900">Access the Nagrik Civic Dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-1.5">Email</label>
                        <input
                            type="email"
                            placeholder="admin@nagar.gov"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadcn-input w-full px-4 py-2.5"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-1.5">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadcn-input w-full px-4 py-2.5"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-zinc-900 text-white font-bold rounded-none hover:opacity-90 transition-all">
                        Sign In
                    </button>
                </form>

                <button onClick={() => router.push('/')} className="w-full mt-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">
                    ← Back to Citizen Portal
                </button>
            </div>
        </div>
    );
}
