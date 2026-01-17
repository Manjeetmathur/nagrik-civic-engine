'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, PieChart, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { GoogleMapsIcon } from '@/components/GoogleMapsIcon';
import { AdminVoiceMap } from '@/components/admin-voice-map';
import { AdminVoiceCharts } from '@/components/admin-voice-charts';
import { AdminVoiceReportsTable } from '@/components/admin-voice-reports-table';

interface Report {
    id: string;
    keyword: string;
    category: string;
    description: string;
    latitude: number;
    longitude: number;
    severity: "low" | "medium" | "high";
    createdAt: string;
    speechStressData?: {
        wordsPerSecond: number;
        repeatedWords: number;
        pauseCount: number;
        averagePauseDuration: number;
        confidence: number;
        stressIndicators: string;
    } | null;
}

const VoiceHubPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'log'>('map');
    const [reports, setReports] = useState<Report[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col h-[calc(100vh-10rem)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Voice Intelligence Hub</h1>
                    <p className="text-zinc-500 mt-1">Unified command for voice-driven safety reporting</p>
                </div>

                <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'map' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                    >
                        <MapPin size={16} /> Live Map
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                    >
                        <PieChart size={16} /> Intelligence
                    </button>
                    <button
                        onClick={() => setActiveTab('log')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'log' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                    >
                        <FileText size={16} /> Incident Log
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'map' && (
                    <div className="flex h-full gap-6 overflow-hidden">
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
                        <div className={`hidden lg:flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-80'}`}>
                            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                                {!sidebarCollapsed && (
                                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                        <MapPin size={16} className="text-indigo-600" />
                                        Active Reports ({reports.length})
                                    </h3>
                                )}
                                <button
                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-600 hover:text-zinc-900"
                                >
                                    {sidebarCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                </button>
                            </div>
                            {!sidebarCollapsed && (
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
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="h-full overflow-y-auto pr-2">
                        <AdminVoiceCharts />
                    </div>
                )}

                {activeTab === 'log' && (
                    <div className="h-full overflow-y-auto pr-2">
                        <AdminVoiceReportsTable data={reports} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceHubPage;
