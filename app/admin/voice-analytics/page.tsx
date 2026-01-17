'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import Layout from '@/components/Layout';
import { AdminVoiceCharts } from '@/components/admin-voice-charts';

export default function AdminVoiceAnalyticsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('nagar_user');
        if (!storedUser) {
            router.push('/admin');
            return;
        }
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('nagar_user');
        router.push('/');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] gap-4">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <Layout
            currentView="voice-analytics"
            onNavigate={(view) => router.push(view === 'dashboard' ? '/admin/dashboard' : `/admin/${view}`)}
            onLogout={handleLogout}
            user={user}
            isBackendLive={true}
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                    <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                    <p className="mt-4 text-zinc-500 font-medium">Loading Voice Analytics...</p>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Voice Analytics</h1>
                        <p className="text-zinc-500 mt-1">Real-time speech stress analysis insights and indicators</p>
                    </div>
                    <AdminVoiceCharts />
                </div>
            )}
        </Layout>
    );
}
