'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import Layout from '@/components/Layout';
import AirQualityPage from '@/components/pages/AirQualityPage';

export default function AirQualityAdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('nagar_user');
        if (!storedUser) {
            router.push('/admin');
            return;
        }
        setUser(JSON.parse(storedUser));
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
            currentView="air-quality"
            onNavigate={(view) => handleNavigate(view)}
            onLogout={handleLogout}
            user={user}
            isBackendLive={true}
        >
            <AirQualityPage />
        </Layout>
    );
}
