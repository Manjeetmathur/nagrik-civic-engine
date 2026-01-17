'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Alert } from '@/types';
import Layout from '@/components/Layout';
import FeedbackReportsPage from '@/components/pages/FeedbackReportsPage';
import { api } from '@/lib/api';

export default function AdminFeedbackReportsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
    const [isBackendLive, setIsBackendLive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            const storedUser = localStorage.getItem('nagar_user');
            if (!storedUser) {
                router.push('/admin');
                return;
            }
            setUser(JSON.parse(storedUser));
            const { data, isLive } = await api.getAlerts(1, 100); // Get more alerts for feedback
            setAllAlerts(data);
            setIsBackendLive(isLive);
            setIsLoading(false);
        };
        initialize();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('nagar_user');
        router.push('/');
    };

    const handleNavigate = (view: string) => {
        router.push(`/admin/${view}`);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] gap-4">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <Layout
            currentView="feedback-reports"
            onNavigate={(view) => handleNavigate(view)}
            onLogout={handleLogout}
            user={user}
            isBackendLive={isBackendLive}
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                    <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                    <p className="mt-4 text-zinc-500 font-medium">Loading Feedback Reports...</p>
                </div>
            ) : (
                <FeedbackReportsPage alerts={allAlerts} />
            )}
        </Layout>
    );
}
