'use client';

import React from 'react';
import { Alert, AlertStatus } from '@/types';
import { X, MapPin, Clock, Camera, User, CheckCircle, XCircle, Ban } from 'lucide-react';

interface AlertModalProps {
    alert: Alert;
    onClose: () => void;
    onUpdateStatus?: (id: string, status: AlertStatus) => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ alert, onClose, onUpdateStatus }) => {
    const handleStatusUpdate = (status: AlertStatus) => {
        if (onUpdateStatus) {
            onUpdateStatus(alert.id, status);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Alert Details</h2>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{alert.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="p-6 space-y-6">
                        {/* Image */}
                        <div className="relative w-full h-96 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200">
                            <img
                                src={alert.fullImageUrl}
                                alt="Alert"
                                className="w-full h-full object-cover"
                            />

                            {/* Detection overlays */}
                            {alert.detections && alert.detections.map((detection, idx) => (
                                <div
                                    key={idx}
                                    className="absolute border-2 border-red-500 bg-red-500/10"
                                    style={{
                                        top: `${(detection.top / 600) * 100}%`,
                                        left: `${(detection.left / 800) * 100}%`,
                                        width: `${(detection.width / 800) * 100}%`,
                                        height: `${(detection.height / 600) * 100}%`,
                                    }}
                                >
                                    <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                                        {detection.label} {Math.round(detection.confidence * 100)}%
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</label>
                                    <p className="text-lg font-bold text-zinc-900 mt-1">{alert.type}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Location</label>
                                    <p className="text-sm text-zinc-700 mt-1 flex items-center gap-2">
                                        <MapPin size={14} className="text-zinc-400" />
                                        {alert.location}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Timestamp</label>
                                    <p className="text-sm text-zinc-700 mt-1 flex items-center gap-2">
                                        <Clock size={14} className="text-zinc-400" />
                                        {new Date(alert.timestamp).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Confidence</label>
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-zinc-600">Detection Accuracy</span>
                                            <span className="font-bold text-zinc-900">{Math.round(alert.confidence * 100)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full transition-all"
                                                style={{ width: `${alert.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Source</label>
                                    <p className="text-sm text-zinc-700 mt-1 flex items-center gap-2">
                                        {alert.source === 'camera' ? (
                                            <>
                                                <Camera size={14} className="text-zinc-400" />
                                                AI Camera {alert.cameraId && `(${alert.cameraId})`}
                                            </>
                                        ) : (
                                            <>
                                                <User size={14} className="text-zinc-400" />
                                                Citizen Report
                                            </>
                                        )}
                                    </p>
                                </div>

                                {alert.reporter && (
                                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reporter Info</label>
                                        <div className="mt-2 space-y-1 text-sm text-zinc-700">
                                            <p><strong>Name:</strong> {alert.reporter.name}</p>
                                            <p><strong>Phone:</strong> {alert.reporter.phone}</p>
                                            <p><strong>Email:</strong> {alert.reporter.email}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                                    <p className="text-sm text-zinc-700 mt-1 leading-relaxed">{alert.description}</p>
                                </div>

                                {alert.notes && (
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Notes</label>
                                        <p className="text-sm text-zinc-700 mt-1 leading-relaxed">{alert.notes}</p>
                                    </div>
                                )}

                                {alert.feedback && (
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                        <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Citizen Feedback</label>
                                        <div className="mt-2 space-y-1 text-sm text-zinc-700">
                                            <p><strong>Rating:</strong> {alert.feedback.rating}/5 ⭐</p>
                                            <p><strong>Comment:</strong> {alert.feedback.comment}</p>
                                            <p className="text-xs text-zinc-500">Submitted: {new Date(alert.feedback.submittedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Actions */}
                        {onUpdateStatus && (
                            <div className="border-t border-zinc-200 pt-6">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 block">
                                    Update Status
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleStatusUpdate(AlertStatus.RESOLVED)}
                                        disabled={alert.status === AlertStatus.RESOLVED}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <CheckCircle size={18} />
                                        Mark Resolved
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(AlertStatus.PENDING)}
                                        disabled={alert.status === AlertStatus.PENDING}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Clock size={18} />
                                        Mark Pending
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(AlertStatus.DISMISSED)}
                                        disabled={alert.status === AlertStatus.DISMISSED}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-500 text-white rounded-lg font-medium hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Ban size={18} />
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
