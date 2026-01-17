'use client';

import React, { useState, useEffect } from 'react';
import { View, IssueType, AlertStatus, Alert } from '@/types';
import {
    ShieldAlert,
    CheckCircle,
    Video,
    TrendingUp,
    MapPin,
    ArrowRight,
    User as UserIcon,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { api } from '@/lib/api';

interface DashboardPageProps {
    setView: (view: View) => void;
    alerts: Alert[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setView, alerts }) => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchSummary = async () => {
        setLoading(true);
        const data = await api.getAnalyticsSummary();
        setSummary(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchSummary();
    }, [alerts]);

    const stats = [
        {
            label: 'Active Alerts',
            value: summary?.stats?.activeAlerts ?? '...',
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
            value: summary?.stats?.totalIncidents ?? '...',
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
    ];

    const recentAlerts = alerts.slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
                    <p className="text-zinc-500">Real-time smart city safety monitoring overview.</p>
                </div>
                <button
                    onClick={fetchSummary}
                    className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="shadcn-card p-6 flex flex-col justify-between group hover:border-zinc-300 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                            <div className={`${stat.bg} p-1.5 rounded-lg`}>
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
                            <p className="text-xs text-zinc-500">Visualized distribution of safety reports over time.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
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

                {/* Source Distribution */}
                <div className="shadcn-card p-6 flex flex-col">
                    <h3 className="font-bold text-zinc-900 mb-6">Alert Sources</h3>
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-zinc-500 flex items-center gap-1.5"><Video size={12} /> AI Cameras</span>
                                <span className="text-zinc-900">{summary?.stats ? Math.round((summary.stats.onlineCameras / summary.stats.totalCameras) * 100) : 72}%</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: summary?.stats ? `${(summary.stats.onlineCameras / summary.stats.totalCameras) * 100}%` : '72%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-zinc-500 flex items-center gap-1.5"><UserIcon size={12} /> Citizen Reports</span>
                                <span className="text-zinc-900">28%</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-zinc-400 rounded-full" style={{ width: '28%' }}></div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setView('analytics')}
                        className="mt-8 w-full py-2.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 flex items-center justify-center gap-2 transition-all"
                    >
                        Full Analysis <ArrowRight size={14} />
                    </button>
                </div>
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
                                            <div className="h-8 w-8 rounded bg-zinc-100 overflow-hidden border border-zinc-200">
                                                <img src={alert.thumbnailUrl} alt="Alert" className="h-full w-full object-cover" />
                                            </div>
                                            <span className="text-sm font-medium text-zinc-900">{alert.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${alert.source === 'camera' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                            }`}>
                                            {alert.source === 'camera' ? 'AI CAM' : 'CITIZEN'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
                                            <MapPin size={12} /> {alert.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${alert.status === AlertStatus.PENDING ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {alert.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
