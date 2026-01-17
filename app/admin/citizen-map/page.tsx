'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Alert } from '@/types';
import Layout from '@/components/Layout';
import { AdminCitizenMap } from '@/components/admin-citizen-map';
import { MapPin } from 'lucide-react';
import { GoogleMapsIcon } from '@/components/GoogleMapsIcon';

export default function AdminCitizenMapPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

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
        const fetchAlerts = async () => {
            try {
                const res = await fetch("/api/alerts");
                if (!res.ok) throw new Error("Failed to fetch alerts");
                const data = await res.json();
                // Filter alerts that have coordinates
                const alertsWithCoords = Array.isArray(data)
                    ? data.filter((alert: Alert) => alert.reporter?.coordinates)
                    : [];
                setAlerts(alertsWithCoords);
            } catch (err) {
                console.error("Failed to fetch alerts", err);
                setAlerts([]);
            } finally {
                setLoadingAlerts(false);
            }
        };

        fetchAlerts();
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

    return (
        <Layout
            currentView="citizen-map"
            onNavigate={(view) => router.push(view === 'dashboard' ? '/admin/dashboard' : `/admin/${view}`)}
            onLogout={handleLogout}
            user={user}
            isBackendLive={true}
        >
            <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Citizen Reports Map</h1>
                        <p className="text-zinc-500 mt-1">Geospatial view of citizen-submitted reports</p>
                    </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Map Container */}
                    <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">
                        {loadingAlerts && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                            </div>
                        )}
                        <AdminCitizenMap alerts={alerts} selectedAlert={selectedAlert} />
                    </div>

                    {/* Sidebar List */}
                    <div className="w-80 hidden lg:flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                <MapPin size={16} className="text-indigo-600" />
                                Citizen Reports ({alerts.length})
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {alerts.map(alert => {
                                const coords = alert.reporter?.coordinates;
                                return (
                                    <div
                                        key={alert.id}
                                        className={`rounded-lg border transition-all ${selectedAlert?.id === alert.id
                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                            : 'bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-200'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setSelectedAlert(alert)}
                                            className="w-full text-left p-3"
                                        >
                                            <div className="flex justify-between mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedAlert?.id === alert.id ? 'text-indigo-700' : 'text-zinc-500'
                                                    }`}>
                                                    {alert.id.slice(0, 8)}
                                                </span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${alert.status === 'Pending' ? 'bg-red-100 text-red-700' :
                                                    alert.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {alert.status}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-zinc-900 mb-0.5">{alert.type}</p>
                                            <p className="text-xs text-zinc-500 line-clamp-2">{alert.description}</p>
                                            {alert.reporter && (
                                                <p className="text-[10px] text-zinc-400 mt-1">By: {alert.reporter.name}</p>
                                            )}
                                        </button>
                                        {coords && (
                                            <div className="px-3 pb-3">
                                                <a
                                                    href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    <GoogleMapsIcon size={14} />
                                                    Open in Google Maps
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
