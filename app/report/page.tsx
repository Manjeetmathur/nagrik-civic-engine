'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { IssueType, Alert } from '@/types';
import { Camera, MapPin, Upload, X, ArrowLeft } from 'lucide-react';

export default function ReportIssuePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [submitting, setSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        type: IssueType.POTHOLE,
        location: '',
        description: '',
        reporter: {
            name: '',
            phone: '',
            email: ''
        }
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!preview && !formData.description) {
            alert('Please provide either an image or a description');
            return;
        }

        setSubmitting(true);
        try {
            const report = {
                ...formData,
                imageUrl: preview || '/placeholder-issue.jpg', // Fallback or handle backend
                timestamp: new Date().toISOString() // Let backend handle real time, but useful for preview
            };

            const result = await api.submitReport(report);
            if (result && result.id) {
                router.push(`/track/${result.id}`);
            } else {
                alert('Failed to submit report. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6"
                >
                    <ArrowLeft size={20} />
                    Back to Portal
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
                    <div className="bg-zinc-900 p-6 text-white">
                        <h1 className="text-2xl font-bold">Report an Issue</h1>
                        <p className="text-zinc-400 mt-1">Help us keep the city clean and safe</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Issue Type */}
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Issue Type</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.values(IssueType).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type })}
                                        className={`p-3 text-sm font-medium rounded-xl border transition-all ${formData.type === type
                                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg scale-105'
                                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-zinc-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter address or landmark"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Evidence Photo</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />

                            {preview ? (
                                <div className="relative w-full h-64 bg-zinc-100 rounded-xl overflow-hidden group">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreview(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-40 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-zinc-900 hover:bg-zinc-50 transition-all text-zinc-500 hover:text-zinc-900"
                                >
                                    <Camera size={32} />
                                    <span className="font-medium">Click to upload photo</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Description</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Describe the issue in detail..."
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Reporter Info (Optional) */}
                        <div className="pt-4 border-t border-zinc-100">
                            <h3 className="text-sm font-bold text-zinc-900 mb-4">Your Details (Optional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="px-4 py-2.5 rounded-xl border border-zinc-200 outline-none focus:border-zinc-900"
                                    value={formData.reporter.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        reporter: { ...formData.reporter, name: e.target.value }
                                    })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="px-4 py-2.5 rounded-xl border border-zinc-200 outline-none focus:border-zinc-900"
                                    value={formData.reporter.phone}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        reporter: { ...formData.reporter, phone: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-zinc-900 text-white font-bold text-lg rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-900/20"
                        >
                            {submitting ? 'Submitting Report...' : 'Submit Report'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
