'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import Layout from '@/components/Layout';
import VoiceHubPage from '@/components/pages/VoiceHubPage';

export default function AdminVoiceHubPage() {
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

    return (
        <Layout
            currentView="voice"
            onNavigate={(view) => router.push(view === 'dashboard' ? '/admin/dashboard' : `/admin/${view}`)}
            onLogout={handleLogout}
            user={user}
            isBackendLive={true}
        >
            <VoiceHubPage />
        </Layout>
    );
}
