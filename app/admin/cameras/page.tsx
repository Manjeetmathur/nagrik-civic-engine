'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import Layout from '@/components/Layout';
import CamerasPage from '@/components/pages/CamerasPage';

export default function AdminCamerasPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isBackendLive, setIsBackendLive] = useState(false);
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] gap-4">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <Layout
            currentView="cameras"
            onNavigate={(view) => router.push(`/admin/${view}`)}
            onLogout={handleLogout}
            user={user}
            isBackendLive={isBackendLive}
        >
            <CamerasPage />
        </Layout>
    );
}
