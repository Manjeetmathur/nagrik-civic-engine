'use client';

import React from 'react';
import { Alert } from '@/types';
import { MessageSquare, Star, MapPin, Clock, User } from 'lucide-react';

interface FeedbackReportsPageProps {
    alerts: Alert[];
}

const FeedbackReportsPage: React.FC<FeedbackReportsPageProps> = ({ alerts }) => {
    // Filter alerts that have feedback
    const alertsWithFeedback = alerts.filter(alert => alert.feedback);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Feedback Reports</h1>
                <p className="text-zinc-900">Community feedback and ratings for all reported incidents.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="shadcn-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Total Feedback</span>
                        <MessageSquare size={16} className="text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900">{alertsWithFeedback.length}</h3>
                </div>

                <div className="shadcn-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Average Rating</span>
                        <Star size={16} className="text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900">
                        {alertsWithFeedback.length > 0
                            ? (alertsWithFeedback.reduce((sum, alert) => sum + (alert.feedback?.rating || 0), 0) / alertsWithFeedback.length).toFixed(1)
                            : '0.0'}
                        <span className="text-sm text-zinc-600">/5</span>
                    </h3>
                </div>

                <div className="shadcn-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Pending Feedback</span>
                        <MessageSquare size={16} className="text-zinc-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900">{alerts.length - alertsWithFeedback.length}</h3>
                </div>
            </div>

            {/* Feedback List */}
            <div className="shadcn-card overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100">
                    <h3 className="font-bold text-zinc-900">All Feedback Submissions</h3>
                </div>

                {alertsWithFeedback.length === 0 ? (
                    <div className="py-20 text-center">
                        <MessageSquare size={40} className="mx-auto text-zinc-200 mb-4" />
                        <p className="text-zinc-900 font-medium">No feedback submissions yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {alertsWithFeedback.map((alert) => (
                            <div key={alert.id} className="p-6 hover:bg-zinc-50 transition-colors">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Alert Image */}
                                    <div className="w-full md:w-32 h-24 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0">
                                        <img src={alert.thumbnailUrl} className="w-full h-full object-cover" alt={alert.type} />
                                    </div>

                                    {/* Alert Info */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${alert.type === 'Accident' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {alert.type}
                                                </span>
                                                <span className="text-xs text-zinc-500">ID: {alert.id}</span>
                                            </div>
                                            <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                                                <MapPin size={14} className="text-zinc-600" />
                                                {alert.location}
                                            </h4>
                                            <p className="text-xs text-zinc-900 mt-1">{alert.description}</p>
                                        </div>

                                        {/* Feedback */}
                                        {alert.feedback && (
                                            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span key={star} className={`text-sm ${star <= alert.feedback!.rating ? 'text-amber-500' : 'text-zinc-300'}`}>
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs font-bold text-zinc-900">({alert.feedback.rating}/5)</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                                        <Clock size={12} />
                                                        {new Date(alert.feedback.submittedAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-zinc-900 italic">"{alert.feedback.comment}"</p>
                                            </div>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-xs text-zinc-600">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </span>
                                            {alert.reporter && (
                                                <span className="flex items-center gap-1.5">
                                                    <User size={12} />
                                                    {alert.reporter.name}
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${alert.source === 'camera' ? 'bg-indigo-50 text-indigo-700' : 'bg-zinc-100 text-zinc-700'}`}>
                                                {alert.source === 'camera' ? 'AI Camera' : 'Citizen'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackReportsPage;
