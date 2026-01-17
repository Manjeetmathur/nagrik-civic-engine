'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import Layout from '@/components/Layout';
import { Send, Mail, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/components/PageTransition';

type AuthorityType = 'fire' | 'hospital' | 'police';
type PriorityLevel = 'low' | 'medium' | 'high';

interface FormData {
    authorityType: AuthorityType;
    recipientEmail: string;
    subject: string;
    message: string;
    priority: PriorityLevel;
    includeLocation: boolean;
    latitude: string;
    longitude: string;
}

export default function AuthorityContactPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isBackendLive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const [formData, setFormData] = useState<FormData>({
        authorityType: 'fire',
        recipientEmail: 'fire.department@example.com',
        subject: '',
        message: '',
        priority: 'medium',
        includeLocation: false,
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('nagar_user');
        if (!storedUser) {
            router.push('/admin');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('nagar_user');
        router.push('/');
    };

    const handleNavigate = (view: string) => {
        router.push(`/admin/${view}`);
    };

    const authorityDefaults = {
        fire: {
            email: 'fire.department@example.com',
            icon: '🚒',
            name: 'Fire Department',
            color: 'bg-red-500',
            borderColor: 'outline-red-500'
        },
        hospital: {
            email: 'emergency@hospital.example.com',
            icon: '🏥',
            name: 'Hospital/Medical Services',
            color: 'bg-blue-500',
            borderColor: 'outline-blue-500'
        },
        police: {
            email: 'police.station@example.com',
            icon: '🚔',
            name: 'Police Department',
            color: 'bg-purple-500',
            borderColor: 'outline-purple-500'
        }
    };

    const handleAuthorityChange = (type: AuthorityType) => {
        setFormData({
            ...formData,
            authorityType: type,
            recipientEmail: authorityDefaults[type].email
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification(null);

        try {
            const payload = {
                authorityType: formData.authorityType,
                recipientEmail: formData.recipientEmail,
                subject: formData.subject,
                message: formData.message,
                priority: formData.priority,
                senderName: user?.name || 'Admin User',
                senderEmail: user?.email || 'admin@nagrik.gov',
                ...(formData.includeLocation && formData.latitude && formData.longitude
                    ? {
                        location: {
                            latitude: parseFloat(formData.latitude),
                            longitude: parseFloat(formData.longitude)
                        }
                    }
                    : {})
            };

            const response = await fetch('/api/authority-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setNotification({
                    type: 'success',
                    message: 'Email sent successfully to authority!'
                });
                // Reset form
                setFormData({
                    ...formData,
                    subject: '',
                    message: '',
                    latitude: '',
                    longitude: '',
                    includeLocation: false
                });
            } else {
                setNotification({
                    type: 'error',
                    message: data.error || 'Failed to send email'
                });
            }
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Network error. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] gap-4">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    const currentAuthority = authorityDefaults[formData.authorityType];

    return (
        <Layout
            currentView="authority-contact"
            onNavigate={(view) => handleNavigate(view)}
            onLogout={handleLogout}
            user={user}
            isBackendLive={isBackendLive}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-zinc-900 p-3 rounded-none">
                            <Mail className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900">Contact Authorities</h1>
                    </div>
                    <p className="text-zinc-600">
                        Send official communications to emergency services and authorities
                    </p>
                </motion.div>

                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-6 p-4 rounded-none border-2 flex items-start gap-3 ${notification.type === 'success'
                                ? 'bg-green-50 border-green-500 text-green-900'
                                : 'bg-red-50 border-red-500 text-red-900'
                                }`}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            )}
                            <p className="font-medium">{notification.message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-none p-8 space-y-6">
                    {/* Authority Type Selection */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-3">
                            Select Authority Type
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(Object.keys(authorityDefaults) as AuthorityType[]).map((type) => {
                                const authority = authorityDefaults[type];
                                const isSelected = formData.authorityType === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleAuthorityChange(type)}
                                        className={`p-4 border-2 rounded-none transition-all ${isSelected
                                            ? `${authority.borderColor} bg-zinc-50`
                                            : 'border-zinc-200 hover:border-zinc-400'
                                            }`}
                                    >
                                        <div className="text-4xl mb-2">{authority.icon}</div>
                                        <div className="text-sm font-bold text-zinc-900">
                                            {authority.name}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recipient Email */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-1.5">
                            Recipient Email
                        </label>
                        <input
                            type="email"
                            value={formData.recipientEmail}
                            onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                            className="shadcn-input w-full px-4 py-2.5"
                            required
                        />
                    </div>

                    {/* Priority Level */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-3">
                            Priority Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['low', 'medium', 'high'] as PriorityLevel[]).map((priority) => {
                                const isSelected = formData.priority === priority;
                                const colors = {
                                    low: 'outline-green-500 bg-green-50 text-green-900',
                                    medium: 'outline-yellow-500 bg-yellow-50 text-yellow-900',
                                    high: 'outline-red-500 bg-red-50 text-red-900'
                                };
                                return (
                                    <button
                                        key={priority}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority })}
                                        className={`px-4 py-2.5 border-2 rounded-none font-bold text-sm uppercase transition-all ${isSelected
                                            ? colors[priority]
                                            : 'border-zinc-200 hover:border-zinc-400'
                                            }`}
                                    >
                                        {priority}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-1.5">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="shadcn-input w-full px-4 py-2.5"
                            placeholder="Enter subject line"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-1.5">
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="shadcn-input w-full px-4 py-2.5 min-h-[200px] resize-y"
                            placeholder="Enter your message..."
                            required
                        />
                    </div>

                    {/* Location (Optional) */}
                    <div className="border-t border-zinc-200 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="includeLocation"
                                checked={formData.includeLocation}
                                onChange={(e) =>
                                    setFormData({ ...formData, includeLocation: e.target.checked })
                                }
                                className="w-4 h-4"
                            />
                            <label htmlFor="includeLocation" className="text-sm font-bold text-zinc-900">
                                Include Location Coordinates
                            </label>
                        </div>

                        {formData.includeLocation && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-1.5">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) =>
                                            setFormData({ ...formData, latitude: e.target.value })
                                        }
                                        className="shadcn-input w-full px-4 py-2.5"
                                        placeholder="e.g., 28.6139"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight block mb-1.5">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) =>
                                            setFormData({ ...formData, longitude: e.target.value })
                                        }
                                        className="shadcn-input w-full px-4 py-2.5"
                                        placeholder="e.g., 77.2090"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-none hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Email
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
