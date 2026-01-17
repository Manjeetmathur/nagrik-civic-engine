'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Alert, AlertStatus } from '@/types';
import Layout from '@/components/Layout';
import AlertsPage from '@/components/pages/AlertsPage';
import { api } from '@/lib/api';

export default function AdminCitizenReportsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isBackendLive, setIsBackendLive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            const storedUser = localStorage.getItem('nagar_user');
            if (!storedUser) {
                router.push('/admin');
                return;
            }
            setUser(JSON.parse(storedUser));
            const { data, isLive } = await api.getAlerts(1, 20);
            setAllAlerts(data);
            setHasMore(data.length === 20);
            setIsBackendLive(isLive);
            setIsLoading(false);
        };
        initialize();
    }, [router]);

    const handleLoadMore = async () => {
        if (isFetchingMore || !hasMore) return;
        setIsFetchingMore(true);
        const nextPage = page + 1;
        const { data } = await api.getAlerts(nextPage, 20);
        if (data.length > 0) {
            setAllAlerts(prev => [...prev, ...data]);
            setPage(nextPage);
            setHasMore(data.length === 20);
        } else {
            setHasMore(false);
        }
        setIsFetchingMore(false);
    };

    const updateAlertStatus = async (id: string, status: AlertStatus) => {
        const updated = await api.updateStatus(id, status);
        if (updated) {
            setAllAlerts(prev => prev.map(a => a.id === id ? updated : a));
        }
    };

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
            currentView="citizen-reports"
            onNavigate={(view) => router.push(`/admin/${view}`)}
            onLogout={handleLogout}
            user={user}
            isBackendLive={isBackendLive}
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                    <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                    <p className="mt-4 text-zinc-500 font-medium">Loading Citizen Reports...</p>
                </div>
            ) : (
                <AlertsPage
                    alerts={allAlerts.filter(a => a.source === 'citizen')}
                    onUpdateAlert={updateAlertStatus}
                    forceSource="citizen"
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isFetchingMore={isFetchingMore}
                />
            )}
        </Layout>
    );
}
