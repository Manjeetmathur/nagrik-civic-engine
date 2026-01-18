'use client';

import React, { useState } from 'react';
import { Alert, AlertStatus, IssueType } from '@/types';
import { Filter, MapPin, Clock, Camera, User, Search } from 'lucide-react';
import AlertModal from '@/components/AlertModal';

interface AlertsPageProps {
    alerts: Alert[];
    onUpdateAlert: (id: string, status: AlertStatus) => void;
    forceSource?: 'camera' | 'citizen';
    onLoadMore?: () => void;
    hasMore?: boolean;
    isFetchingMore?: boolean;
}

const AlertsPage: React.FC<AlertsPageProps> = ({
    alerts,
    onUpdateAlert,
    forceSource,
    onLoadMore,
    hasMore,
    isFetchingMore
}) => {
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
    const [sourceFilter, setSourceFilter] = useState<'all' | 'camera' | 'citizen'>(forceSource || 'all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAlerts = alerts.filter(alert => {
        const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
        const matchesSource = sourceFilter === 'all' || alert.source === sourceFilter;
        const matchesSearch = searchQuery === '' ||
            alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSource && matchesSearch;
    });

    return (
        <>
            {selectedAlert && (
                <AlertModal
                    alert={selectedAlert}
                    onClose={() => setSelectedAlert(null)}
                    onUpdateStatus={onUpdateAlert}
                />
            )}

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                        {forceSource === 'citizen' ? 'Citizen Reports' : 'All Alerts'}
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        {forceSource === 'citizen'
                            ? 'Reports submitted by citizens through the portal'
                            : 'Monitor and manage all safety incidents across the city'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by location, type, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="shadcn-input w-full pl-10 pr-4 py-2.5"
                        />
                    </div>

                    {!forceSource && (
                        <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value as any)}
                            className="shadcn-input px-4 py-2.5"
                        >
                            <option value="all">All Sources</option>
                            <option value="camera">AI Cameras</option>
                            <option value="citizen">Citizen Reports</option>
                        </select>
                    )}

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="shadcn-input px-4 py-2.5"
                    >
                        <option value="all">All Status</option>
                        <option value={AlertStatus.PENDING}>Pending</option>
                        <option value={AlertStatus.RESOLVED}>Resolved</option>
                        <option value={AlertStatus.DISMISSED}>Dismissed</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="shadcn-card p-4">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-bold text-zinc-900 mt-1">{filteredAlerts.length}</p>
                    </div>
                    <div className="shadcn-card p-4">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pending</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                            {filteredAlerts.filter(a => a.status === AlertStatus.PENDING).length}
                        </p>
                    </div>
                    <div className="shadcn-card p-4">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Resolved</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">
                            {filteredAlerts.filter(a => a.status === AlertStatus.RESOLVED).length}
                        </p>
                    </div>
                    <div className="shadcn-card p-4">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dismissed</p>
                        <p className="text-2xl font-bold text-zinc-400 mt-1">
                            {filteredAlerts.filter(a => a.status === AlertStatus.DISMISSED).length}
                        </p>
                    </div>
                </div>

                {/* Alerts Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredAlerts.length === 0 ? (
                        <div className="shadcn-card p-12 text-center">
                            <Filter size={40} className="mx-auto text-zinc-200 mb-4" />
                            <p className="text-zinc-500 font-medium">No alerts match your filters</p>
                        </div>
                    ) : (
                        filteredAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="shadcn-card p-5 flex flex-col md:flex-row gap-6 hover:border-zinc-300 transition-colors group cursor-pointer"
                                onClick={() => setSelectedAlert(alert)}
                            >
                                <div className="w-full md:w-40 h-32 rounded-none bg-zinc-100 overflow-hidden border border-zinc-100 shrink-0">
                                    <img src={alert.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={alert.type} />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-lg font-bold uppercase tracking-wider ${alert.type === IssueType.ACCIDENT ? 'text-red-600' :
                                                alert.type === IssueType.TRAFFIC ? 'text-amber-600' :
                                                    alert.type === IssueType.POTHOLE ? 'text-orange-600' :
                                                        'text-indigo-600'
                                                }`}>
                                                {alert.type}
                                            </span>
                                            <span className={`px-3 py-1 rounded-none text-[9px] font-bold uppercase ${alert.status === AlertStatus.PENDING ? 'bg-red-50 text-red-600' :
                                                alert.status === AlertStatus.RESOLVED ? 'bg-indigo-50 text-indigo-600' :
                                                    'bg-zinc-100 text-zinc-600'
                                                }`}>
                                                {alert.status}
                                            </span>
                                        </div>

                                        <h3 className="font-medium text-zinc-500 text-xs mb-1">{alert.location}</h3>
                                        <p className="text-sm text-zinc-600 line-clamp-2 mb-3">{alert.description}</p>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                {alert.source === 'camera' ? <Camera size={14} /> : <User size={14} />}
                                                {alert.source === 'camera' ? `Camera ${alert.cameraId}` : 'Citizen Report'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={14} />
                                                ID: {alert.id.slice(0, 8)}...
                                            </span>
                                        </div>
                                    </div>

                                    {alert.reporter && (
                                        <div className="mt-4 pt-4 border-t border-zinc-100">
                                            <p className="text-xs text-zinc-500">
                                                <strong>Reporter:</strong> {alert.reporter.name} • {alert.reporter.phone}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {hasMore && (
                    <div className="mt-8 flex justify-center pb-8">
                        <button
                            onClick={onLoadMore}
                            disabled={isFetchingMore}
                            className="px-6 py-2 bg-white border border-zinc-200 rounded-none text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isFetchingMore ? (
                                <div className="h-4 w-4 border-2 border-zinc-200 border-t-zinc-900 rounded-none animate-spin"></div>
                            ) : null}
                            {isFetchingMore ? 'Loading reports...' : 'Load More Reports'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default AlertsPage;
