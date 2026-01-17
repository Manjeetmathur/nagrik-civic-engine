'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BarChart3, PieChart, TrendingUp, Clock } from 'lucide-react';
import {
    ResponsiveContainer,
    PieChart as RechartsPie,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

const AnalyticsPage: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await api.getAnalyticsSummary();
            setSummary(data);
            setLoading(false);
        };
        fetchData();
    }, []);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Analytics</h1>
                <p className="text-zinc-500 mt-1">Comprehensive insights into safety incident patterns</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="shadcn-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Incidents</p>
                        <BarChart3 size={16} className="text-zinc-400" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900">{summary?.stats?.totalIncidents || 77}</p>
                    <p className="text-xs text-zinc-500 mt-1">All time</p>
                </div>

                <div className="shadcn-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Avg Resolution</p>
                        <Clock size={16} className="text-zinc-400" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900">4.2h</p>
                    <p className="text-xs text-zinc-500 mt-1">Average time</p>
                </div>

                <div className="shadcn-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Resolution Rate</p>
                        <TrendingUp size={16} className="text-indigo-600" />
                    </div>
                    <p className="text-3xl font-bold text-indigo-600">87%</p>
                    <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
                </div>

                <div className="shadcn-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Citizen Reports</p>
                        <PieChart size={16} className="text-zinc-400" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900">28%</p>
                    <p className="text-xs text-zinc-500 mt-1">Of total alerts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issue Type Distribution */}
                <div className="shadcn-card p-6">
                    <h3 className="font-bold text-zinc-900 mb-6">Issue Type Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={issueTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {issueTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {issueTypeData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-zinc-600">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Health */}
                <div className="shadcn-card p-6">
                    <h3 className="font-bold text-zinc-900 mb-6">Status Health</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {statusData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-zinc-600">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly Timeline */}
            <div className="shadcn-card p-6">
                <h3 className="font-bold text-zinc-900 mb-6">Weekly Incident Timeline</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timelineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="incidents" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
