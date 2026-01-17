'use client';

import React, { useState, useEffect } from 'react';
import { View, Alert, AlertStatus } from '@/types';
import {
    ShieldAlert,
    CheckCircle,
    Video,
    TrendingUp,
    MapPin,
    ArrowRight,
    User as UserIcon,
    ChevronRight,
    RefreshCw,
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardPageProps {
    setView: (view: View) => void;
    alerts: Alert[];
    onLoadMore?: () => void;
    hasMore?: boolean;
    isFetchingMore?: boolean;
}

// Add these types to match what was in /app/dashboard/page.tsx
type RecentReport = {
    id: string;
    keyword: string;
    description: string;
    createdAt: string;
    speechStressData?: {
        confidence: number;
        wordsPerSecond: number;
        stressIndicators: string;
    } | null;
};

type SpeechStressStats = {
    averageConfidence: number;
    highStressReports: number;
    averageWordsPerSecond: number;
    totalAnalyzed: number;
    commonIndicators: Array<{ indicator: string; count: number }>;
};

const DashboardPage: React.FC<DashboardPageProps> = ({
    setView,
    alerts,
    onLoadMore,
    hasMore,
    isFetchingMore
}) => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // New state for additional data from /api/dashboard
    const [dashboardStats, setDashboardStats] = useState({
        totalReports: 0,
        criticalAlerts: 0,
        inProgress: 0,
    });
    const [speechStressStats, setSpeechStressStats] = useState<SpeechStressStats>({
        averageConfidence: 0,
        highStressReports: 0,
        averageWordsPerSecond: 0,
        totalAnalyzed: 0,
        commonIndicators: [],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch existing analytics summary
            const summaryData = await api.getAnalyticsSummary();
            setSummary(summaryData);

            // Fetch additional dashboard data
            const res = await fetch("/api/dashboard");
            if (res.ok) {
                const data = await res.json();
                setDashboardStats({
                    totalReports: data.totalReports || 0,
                    criticalAlerts: data.criticalAlerts || 0,
                    inProgress: data.inProgress || 0,
                });
                setSpeechStressStats(data.speechStressStats || {
                    averageConfidence: 0,
                    highStressReports: 0,
                    averageWordsPerSecond: 0,
                    totalAnalyzed: 0,
                    commonIndicators: [],
                });
            }
        } catch (e) {
            console.error("Failed to fetch dashboard data", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // Set up real-time refresh every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [alerts]);

    const stats = [
        {
            label: 'Active Alerts',
            value: summary?.stats?.activeAlerts ?? dashboardStats.criticalAlerts,
            icon: ShieldAlert,
            color: 'text-red-600',
            bg: 'bg-red-50'
        },
        {
            label: 'Resolved Today',
            value: summary?.stats?.resolvedToday ?? '...',
            icon: CheckCircle,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Total Incidents',
            value: summary?.stats?.totalIncidents ?? dashboardStats.totalReports,
            icon: TrendingUp,
            color: 'text-zinc-600',
            bg: 'bg-zinc-50'
        },
        {
            label: 'Cameras Online',
            value: summary?.stats ? `${summary.stats.onlineCameras}/${summary.stats.totalCameras}` : '...',
            icon: Video,
            color: 'text-zinc-600',
            bg: 'bg-zinc-50'
        },
        {
            label: 'Avg Resolution',
            value: '4.2h',
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            label: 'Resolution Rate',
            value: '87%',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
    ];

    // Analytics Mock Data
    const issueTypeData = [
        { name: 'Accidents', value: 12, color: '#ef4444' },
        { name: 'Traffic', value: 28, color: '#f59e0b' },
        { name: 'Potholes', value: 15, color: '#f97316' },
        { name: 'Garbage', value: 22, color: '#6366f1' },
    ];

    const statusData = [
        { name: 'Pending', value: 23, color: '#ef4444' },
        { name: 'Resolved', value: 48, color: '#6366f1' },
        { name: 'Dismissed', value: 6, color: '#71717a' },
    ];

    const timelineData = [
        { day: 'Mon', incidents: 12 },
        { day: 'Tue', incidents: 19 },
        { day: 'Wed', incidents: 15 },
        { day: 'Thu', incidents: 22 },
        { day: 'Fri', incidents: 18 },
        { day: 'Sat', incidents: 9 },
        { day: 'Sun', incidents: 7 },
    ];

    const recentAlerts = alerts;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
                    <p className="text-zinc-900">Real-time smart city safety monitoring overview.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="shadcn-card p-6 flex flex-col justify-between group hover:border-zinc-300 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">{stat.label}</span>
                            <div className={`${stat.bg} p-1.5 rounded-none`}>
                                <stat.icon size={16} className={stat.color} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-zinc-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Alerts Chart */}
                <div className="lg:col-span-2 shadcn-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="font-bold text-zinc-900">Incident Frequency</h3>
                            <p className="text-xs text-zinc-900">Visualized distribution of safety reports over time.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-none bg-indigo-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Activity</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { time: '00:00', v: 4 }, { time: '04:00', v: 2 }, { time: '08:00', v: 12 },
                                { time: '12:00', v: 18 }, { time: '16:00', v: 14 }, { time: '20:00', v: 9 }, { time: '23:59', v: 5 }
                            ]}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="v"
                                    stroke="#4f46e5"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Source Distribution */}
                    <div className="shadcn-card p-6 flex flex-col h-full">
                        <h3 className="font-bold text-zinc-900 mb-6">Alert Sources</h3>
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-zinc-700 flex items-center gap-1.5"><Video size={12} /> AI Cameras</span>
                                    <span className="text-zinc-900">{summary?.stats ? Math.round((summary.stats.onlineCameras / summary.stats.totalCameras) * 100) : 72}%</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-100 rounded-none overflow-hidden">
                                    <div className="h-full bg-indigo-600 rounded-none transition-all duration-1000" style={{ width: summary?.stats ? `${(summary.stats.onlineCameras / summary.stats.totalCameras) * 100}%` : '72%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-zinc-700 flex items-center gap-1.5"><UserIcon size={12} /> Citizen Reports</span>
                                    <span className="text-zinc-900">28%</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-100 rounded-none overflow-hidden">
                                    <div className="h-full bg-zinc-400 rounded-none" style={{ width: '28%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytical Charts */}
                <div className="lg:col-span-1 shadcn-card p-6">
                    <h3 className="font-bold text-zinc-900 mb-6">Issue Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={issueTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {issueTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                        {issueTypeData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-[10px] text-zinc-600 font-medium">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1 shadcn-card p-6">
                    <h3 className="font-bold text-zinc-900 mb-6">Status Health</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {statusData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2 text-center flex-col">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-[10px] text-zinc-600 font-medium">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 shadcn-card p-6">
                    <h3 className="font-bold text-zinc-900 mb-6">Weekly Incident Timeline</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="incidents" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Merged Section: System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="shadcn-card p-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-4">System Status</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                            <span className="text-zinc-900">Voice Detection Engine</span>
                            <div className="flex items-center gap-2">
                                <span className="text-green-600">Active</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                            <span className="text-zinc-900">Geolocation Service</span>
                            <div className="flex items-center gap-2">
                                <span className="text-green-600">Operational</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                            <span className="text-zinc-900">Database Connection</span>
                            <div className="flex items-center gap-2">
                                <span className="text-green-600">Connected</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Merged Section: Speech Stress Analysis */}
                {speechStressStats.totalAnalyzed > 0 && (
                    <div className="lg:col-span-2 shadcn-card p-6">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-4">Speech Stress Analysis</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="p-3 bg-zinc-50 rounded-none">
                                <p className="text-xs text-zinc-500 mb-1">Average Confidence</p>
                                <p className="text-2xl font-semibold text-indigo-600">
                                    {speechStressStats.averageConfidence}%
                                </p>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded-none">
                                <p className="text-xs text-zinc-500 mb-1">High Stress Reports</p>
                                <p className="text-2xl font-semibold text-red-500">
                                    {speechStressStats.highStressReports}
                                </p>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded-none">
                                <p className="text-xs text-zinc-500 mb-1">Avg Words/Second</p>
                                <p className="text-2xl font-semibold text-cyan-500">
                                    {speechStressStats.averageWordsPerSecond}
                                </p>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded-none">
                                <p className="text-xs text-zinc-500 mb-1">Total Analyzed</p>
                                <p className="text-2xl font-semibold text-lime-600">
                                    {speechStressStats.totalAnalyzed}
                                </p>
                            </div>
                        </div>
                        {speechStressStats.commonIndicators.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs text-zinc-500 mb-2">Common Stress Indicators</p>
                                <div className="flex flex-wrap gap-2">
                                    {speechStressStats.commonIndicators.map((item, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-red-50 border border-red-100 rounded text-xs text-red-600"
                                        >
                                            {item.indicator} ({item.count})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Recent Alerts Table Preview */}
            <div className="shadcn-card overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-900">Recent Incidents</h3>
                    <button onClick={() => setView('alerts')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View All <ChevronRight size={14} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Incident</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {recentAlerts.map((alert) => (
                                <tr key={alert.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-none bg-zinc-100 overflow-hidden border border-zinc-200">
                                                <img src={alert.thumbnailUrl} alt="Alert" className="h-full w-full object-cover" />
                                            </div>
                                            <span className="text-sm font-medium text-zinc-900">{alert.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider border ${alert.source === 'camera' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                            }`}>
                                            {alert.source === 'camera' ? 'AI CAM' : 'CITIZEN'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-zinc-800 text-xs">
                                            <MapPin size={12} /> {alert.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase ${alert.status === AlertStatus.PENDING ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {alert.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div className="px-6 py-4 border-t border-zinc-100 flex justify-center">
                        <button
                            onClick={onLoadMore}
                            disabled={isFetchingMore}
                            className="text-xs font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isFetchingMore ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <ChevronRight size={14} className="rotate-90" />
                            )}
                            {isFetchingMore ? 'Loading reports...' : 'Load More Reports'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
