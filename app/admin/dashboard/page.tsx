'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Alert, AlertStatus } from '@/types';
import Layout from '@/components/Layout';
import DashboardPage from '@/components/pages/DashboardPage';
import { api } from '@/lib/api';
import { ShieldAlert, X } from 'lucide-react';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isBackendLive, setIsBackendLive] = useState(false);
    const [toast, setToast] = useState<Alert | null>(null);
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

    useEffect(() => {
        if (isBackendLive) {
            const unsubscribe = api.subscribeToAlerts((newAlert) => {
                setAllAlerts(prev => [newAlert, ...prev]);
                setToast(newAlert);
                setTimeout(() => setToast(null), 5000);
            });
            return unsubscribe;
        }
    }, [isBackendLive]);

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

    if (!user) return null;

    return (
        <>
            {toast && (
                <div className="fixed top-20 right-6 z-[100] w-80 bg-zinc-900 text-white rounded-xl shadow-2xl border border-white/10 p-4 animate-in slide-in-from-right duration-500">
                    <div className="flex items-start gap-3">
                        <div className="bg-red-500 p-2 rounded-lg shrink-0">
                            <ShieldAlert size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Critical Alert</p>
                                <button onClick={() => setToast(null)}><X size={14} className="text-zinc-500" /></button>
                            </div>
                            <p className="text-sm font-bold truncate mt-1">{toast.type}</p>
                            <p className="text-[11px] text-zinc-400 line-clamp-1">{toast.location}</p>
                        </div>
                    </div>
                </div>
            )}

            <Layout
                currentView="dashboard"
                onNavigate={(view) => handleNavigate(view)}
                onLogout={handleLogout}
                user={user}
                isBackendLive={isBackendLive}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                        <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                        <p className="mt-4 text-zinc-500 font-medium">Loading Dashboard...</p>
                    </div>
                ) : (
                    <DashboardPage
                        setView={(view) => handleNavigate(view)}
                        alerts={allAlerts}
                        onLoadMore={handleLoadMore}
                        hasMore={hasMore}
                        isFetchingMore={isFetchingMore}
                    />
                )}
            </Layout>
        </>
    );
}
