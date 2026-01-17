'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Alert, AlertStatus } from '@/types';
import { api } from '@/lib/api';
import { ArrowLeft, MapPin, Clock, Camera, User, Star, MessageSquare } from 'lucide-react';

export default function TrackIssuePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [issue, setIssue] = useState<Alert | null>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        const fetchIssue = async () => {
            const data = await api.getAlertById(id);
            setIssue(data);
            setLoading(false);
        };
        fetchIssue();
    }, [id]);

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingFeedback(true);
        await api.submitFeedback(id, rating, comment);
        const updated = await api.getAlertById(id);
        setIssue(updated);
        setSubmittingFeedback(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Issue Not Found</h2>
                    <p className="text-zinc-600 mb-6">The tracking ID you entered could not be found.</p>
                    <button onClick={() => router.push('/')} className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium">
                        Back to Portal
                    </button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: AlertStatus) => {
        switch (status) {
            case AlertStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-200';
            case AlertStatus.RESOLVED: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case AlertStatus.DISMISSED: return 'bg-zinc-50 text-zinc-700 border-zinc-200';
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6"
                >
                    <ArrowLeft size={20} />
                    Back to Portal
                </button>

                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-zinc-50 border-b border-zinc-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 mb-1">Issue Status</h1>
                                <p className="text-sm text-zinc-500 font-mono">{issue.id}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(issue.status)}`}>
                                {issue.status}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Image */}
                        <div className="w-full h-96 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200">
                            <img src={issue.fullImageUrl} alt="Issue" className="w-full h-full object-cover" />
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</label>
                                <p className="text-lg font-bold text-zinc-900 mt-1">{issue.type}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Location</label>
                                <p className="text-sm text-zinc-700 mt-1 flex items-center gap-2">
                                    <MapPin size={14} className="text-zinc-400" />
                                    {issue.location}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reported</label>
                                <p className="text-sm text-zinc-700 mt-1 flex items-center gap-2">
                                    <Clock size={14} className="text-zinc-400" />
                                    {new Date(issue.timestamp).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Source</label>
                                <p className="text-sm text-zinc-700 mt-1 flex items-center gap-2">
                                    {issue.source === 'camera' ? <Camera size={14} className="text-zinc-400" /> : <User size={14} className="text-zinc-400" />}
                                    {issue.source === 'camera' ? 'AI Camera' : 'Citizen Report'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                                <p className="text-sm text-zinc-700 mt-1 leading-relaxed">{issue.description}</p>
                            </div>

                            {issue.notes && (
                                <div className="md:col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Resolution Notes</label>
                                    <p className="text-sm text-zinc-700 mt-1">{issue.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Feedback Section */}
                        {issue.status === AlertStatus.RESOLVED && !issue.feedback && (
                            <div className="border-t border-zinc-200 pt-6">
                                <h3 className="text-lg font-bold text-zinc-900 mb-4">How was our response?</h3>
                                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`p-2 rounded-lg transition-colors ${star <= rating ? 'text-amber-500' : 'text-zinc-300'
                                                        }`}
                                                >
                                                    <Star size={32} fill={star <= rating ? 'currentColor' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-2">Comment (Optional)</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={3}
                                            placeholder="Share your experience..."
                                            className="shadcn-input w-full px-4 py-2.5 text-sm resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingFeedback}
                                        className="w-full py-3 bg-zinc-900 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare size={18} />
                                        {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {issue.feedback && (
                            <div className="border-t border-zinc-200 pt-6">
                                <h3 className="text-lg font-bold text-zinc-900 mb-4">Your Feedback</h3>
                                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={20}
                                                    className={star <= issue.feedback!.rating ? 'text-amber-500' : 'text-zinc-300'}
                                                    fill={star <= issue.feedback!.rating ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-bold text-zinc-900">{issue.feedback.rating}/5</span>
                                    </div>
                                    {issue.feedback.comment && (
                                        <p className="text-sm text-zinc-700">{issue.feedback.comment}</p>
                                    )}
                                    <p className="text-xs text-zinc-500 mt-2">
                                        Submitted: {new Date(issue.feedback.submittedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
