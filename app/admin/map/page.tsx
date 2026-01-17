'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import Layout from '@/components/Layout';
import { AdminVoiceMap } from '@/components/admin-voice-map';
import { MapPin } from 'lucide-react';

interface Report {
    id: string
    keyword: string
    category: string
    description: string
    latitude: number
    longitude: number
    severity: "low" | "medium" | "high"
    createdAt: string
    speechStressData?: {
        wordsPerSecond: number
        repeatedWords: number
        pauseCount: number
        averagePauseDuration: number
        confidence: number
        stressIndicators: string
    } | null
}

export default function AdminMapPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reports, setReports] = useState<Report[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('nagar_user');
        if (!storedUser) {
            router.push('/admin');
            return;
        }
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
    }, [router]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch("/api/reports");
                if (!res.ok) throw new Error("Failed to fetch reports");
                const data = await res.json();
                setReports(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch reports", err);
                setReports([]);
            } finally {
                setLoadingReports(false);
            }
        };

        fetchReports();
    }, []);

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
            currentView="map"
            onNavigate={(view) => router.push(view === 'dashboard' ? '/admin/dashboard' : `/admin/${view}`)}
            onLogout={handleLogout}
            user={user}
            isBackendLive={true}
        >
            <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Live Map</h1>
                        <p className="text-zinc-500 mt-1">Geospatial view of emergency incidents</p>
                    </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Map Container */}
                    <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">
                        {loadingReports && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                            </div>
                        )}
                        <AdminVoiceMap reports={reports} selectedReport={selectedReport} />
                    </div>

                    {/* Sidebar List */}
                    <div className="w-80 hidden lg:flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                <MapPin size={16} className="text-indigo-600" />
                                Active Reports ({reports.length})
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {reports.map(report => (
                                <div
                                    key={report.id}
                                    className={`rounded-lg border transition-all ${selectedReport?.id === report.id
                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                            : 'bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-200'
                                        }`}
                                >
                                    <button
                                        onClick={() => setSelectedReport(report)}
                                        className="w-full text-left p-3"
                                    >
                                        <div className="flex justify-between mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedReport?.id === report.id ? 'text-indigo-700' : 'text-zinc-500'
                                                }`}>
                                                {report.id.slice(0, 8)}
                                            </span>
                                            {report.speechStressData && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${report.speechStressData.confidence >= 60 ? 'bg-red-100 text-red-700' :
                                                        report.speechStressData.confidence >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                    }`}>
                                                    {report.speechStressData.confidence}%
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-zinc-900 mb-0.5">{report.keyword}</p>
                                        <p className="text-xs text-zinc-500 line-clamp-2">{report.description}</p>
                                    </button>
                                    <div className="px-3 pb-3">
                                        <a
                                            href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                                        >
                                            <MapPin size={14} />
                                            Open in Google Maps
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
