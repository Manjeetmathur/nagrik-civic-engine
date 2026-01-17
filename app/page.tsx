'use client';

import React, { useState, useEffect } from 'react';
import { Alert, IssueType, AlertStatus } from '@/types';
import { api } from '@/lib/api';
import {
  ShieldAlert, Camera, MapPin, Send, RefreshCw,
  CheckCircle, Radio, Navigation, AlertTriangle, Search, X, Clock,
  Mic
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { FeedbackForm } from '@/components/FeedbackForm';

export default function CitizenPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'report' | 'live'>('report');
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackInput, setTrackInput] = useState('');
  const [submissionId, setSubmissionId] = useState<string>('');
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [displayedAlertsCount, setDisplayedAlertsCount] = useState(10);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [toast, setToast] = useState<Alert | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: IssueType.GARBAGE,
    location: '',
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data, isLive } = await api.getAlerts();
      setAllAlerts(data);
      setIsBackendLive(isLive);
    };
    fetchData();

    // Capture user's geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  }, []);

  // Subscribe to Live Updates
  useEffect(() => {
    if (isBackendLive) {
      const unsubscribe = api.subscribeToAlerts((newAlert) => {
        setAllAlerts(prev => [newAlert, ...prev]);
        setToast(newAlert);
        setTimeout(() => setToast(null), 5000);
      });
      return unsubscribe;
    }
  }, [isBackendLive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      type: formData.type,
      location: formData.location,
      description: formData.description,
      imageUrl: imagePreview || 'https://picsum.photos/800/600',
      reporter: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        coordinates: userLocation ? {
          lat: userLocation.lat,
          lng: userLocation.lng
        } : null
      }
    };

    const result = await api.submitReport(payload);
    if (result) {
      setSubmissionId(result.id);
      setIsSubmitting(false);
      setStep(2);
    } else {
      setIsSubmitting(false);
      alert("Submission failed. Please try again.");
    }
  };

  // Success Screen
  if (step === 2) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 shadow-sm p-10 text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-zinc-900 text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Report Received</h2>
          <p className="text-sm text-zinc-900 mb-8 leading-relaxed">Thank you for your vigilance. Our AI-driven maintenance department is now analyzing your submission.</p>
          <div className="bg-zinc-50 p-6 rounded-xl mb-8 border border-zinc-100">
            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-1">Live Tracking ID</p>
            <p className="text-2xl font-mono font-bold text-zinc-900 tracking-wider">{submissionId}</p>
          </div>
          <button
            onClick={() => { setStep(1); setActiveTab('report'); setImagePreview(null); }}
            className="w-full py-3 bg-zinc-900 text-white font-bold rounded-lg hover:opacity-90 shadow transition-all"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-[100] w-80 bg-zinc-900 text-white rounded-xl shadow-2xl border border-white/10 p-4 animate-in slide-in-from-right duration-500">
          <div className="flex items-start gap-3">
            <div className="bg-red-500 p-2 rounded-lg shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Critical Alert</p>
                <button onClick={() => setToast(null)}><X size={14} className="text-zinc-500" /></button>
              </div>
              <p className="text-sm font-bold truncate mt-1">{toast.type}</p>
              <p className="text-[11px] text-zinc-400 line-clamp-1">{toast.location}</p>
            </div>
          </div>
        </div>
      )}

      {/* Track Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTrackModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 border border-zinc-200">
            <button onClick={() => setShowTrackModal(false)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Track Status</h3>
            <p className="text-sm text-zinc-900 mb-6">Enter your alphanumeric tracking ID.</p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="E.g. cl0k..."
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="shadcn-input w-full px-4 py-3 outline-none text-center font-mono font-bold tracking-tight"
              />
              <button
                onClick={() => router.push(`/track/${trackInput}`)}
                className="w-full py-3 bg-zinc-900 text-white font-bold rounded-none shadow hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Search size={18} /> View Status
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#fafafa] font-sans">
        {/* Header */}
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center    gap-2.5">
                <div className="  mt-2">
                  <img
                    src="/logo.png"
                    alt="Nagrik Logo"
                    className="object-cover h-25"
                  />
                </div>
              </div>

              <nav className="flex items-center gap-1 bg-zinc-100 p-1 rounded-none">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-none transition-all ${activeTab === 'report' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-700 hover:text-zinc-900'}`}
                >
                  File Report
                </button>
                <button
                  onClick={() => setActiveTab('live')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-none transition-all flex items-center gap-2 ${activeTab === 'live' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-700 hover:text-zinc-900'}`}
                >
                  <Radio size={14} className={activeTab === 'live' ? 'animate-pulse' : ''} /> Area Updates
                </button>
                <button
                  onClick={() => router.push('/voice')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 text-zinc-700 hover:text-zinc-900 `}
                >
                  <Mic size={14} /> Voice Recognition
                </button>
              </nav>

              <div className="flex items-center gap-3">
                <button onClick={() => setShowTrackModal(true)} className="hidden md:block text-xs font-bold text-zinc-700 hover:text-zinc-900">Track ID</button>
                <button onClick={() => router.push('/admin')} className="px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold rounded-none uppercase tracking-wider shadow-sm">Admin Access</button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-12">
          {activeTab === 'report' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-12 space-y-2">
                <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Report Safety Incident</h2>
                <p className="text-zinc-900 text-sm max-w-lg mx-auto leading-relaxed">Integrated computer vision processing for automated municipal response.</p>
              </div>

              <div className="bg-white rounded-none shadow-sm border border-zinc-200 overflow-hidden max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                  <section>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Camera size={14} /> 1. Upload Visual Evidence
                    </label>
                    <div className={`relative w-full rounded-none overflow-hidden ${imagePreview ? 'h-60 border-2 border-indigo-500' : ''}`}>
                      {imagePreview ? (
                        <div className="relative w-full h-full group">
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          <button type="button" onClick={() => setImagePreview(null)} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                          {/* Optional: Allow re-upload directly */}
                          <div className="absolute bottom-3 right-3">
                            <div className="scale-75 origin-bottom-right">
                              <CloudinaryUpload
                                currentImage={imagePreview}
                                onUploadSuccess={setImagePreview}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <CloudinaryUpload onUploadSuccess={setImagePreview} />
                      )}
                    </div>
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">Report Category</label>
                      <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as IssueType })} className="shadcn-input w-full px-4 py-2.5 text-sm">
                        {Object.values(IssueType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">Detected Location</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input required type="text" placeholder="Street or Area" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="shadcn-input w-full pl-9 pr-4 py-2.5 text-sm" />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">Contextual Description</label>
                      <textarea required rows={3} placeholder="Describe what requires attention..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="shadcn-input w-full px-4 py-2.5 text-sm resize-none"></textarea>
                    </div>
                  </section>

                  <section className="pt-6 border-t border-zinc-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">Full Name</label>
                        <input required type="text" placeholder="Your Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="shadcn-input w-full px-4 py-2 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">Phone Number</label>
                        <input required type="tel" placeholder="+91 XXXX XXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="shadcn-input w-full px-4 py-2 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">Email Address</label>
                        <input required type="email" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="shadcn-input w-full px-4 py-2 text-sm" />
                      </div>
                    </div>
                  </section>

                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-zinc-900 text-white font-bold rounded-none shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? <><RefreshCw size={18} className="animate-spin" /> Analyzing Image...</> : <><Send size={18} /> Submit Official Report</>}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">City-Wide Safety Feed</h2>
                  <p className="text-zinc-900 text-sm flex items-center gap-2 mt-1">
                    <Navigation size={12} /> Syncing alerts for your current zone.
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isBackendLive ? 'bg-indigo-50 border-indigo-100' : 'bg-zinc-100 border-zinc-200'}`}>
                  <span className={`h-2 w-2 rounded-full ${isBackendLive ? 'bg-indigo-600 animate-pulse' : 'bg-zinc-400'}`}></span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isBackendLive ? 'text-indigo-700' : 'text-zinc-900'}`}>
                    {isBackendLive ? 'Live System Sync' : 'Local Engine'}
                  </span>
                </div>
              </div>

              {/* Three Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar - Issue Tracking System */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="shadcn-card p-5 sticky top-20">
                    <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-indigo-600" />
                      Issue Tracking
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <div>
                          <p className="text-xs font-bold text-red-900">Critical</p>
                          <p className="text-xl font-bold text-red-600">{allAlerts.filter(a => a.type === IssueType.ACCIDENT).length}</p>
                        </div>
                        <AlertTriangle className="text-red-500" size={24} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div>
                          <p className="text-xs font-bold text-amber-900">Pending</p>
                          <p className="text-xl font-bold text-amber-600">{allAlerts.filter(a => a.status === AlertStatus.PENDING).length}</p>
                        </div>
                        <Clock className="text-amber-500" size={24} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <div>
                          <p className="text-xs font-bold text-green-900">Resolved</p>
                          <p className="text-xl font-bold text-green-600">{allAlerts.filter(a => a.status === AlertStatus.RESOLVED).length}</p>
                        </div>
                        <CheckCircle className="text-green-500" size={24} />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Quick Stats</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Total Reports</span>
                          <span className="font-bold text-zinc-900">{allAlerts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">This Week</span>
                          <span className="font-bold text-zinc-900">{Math.floor(allAlerts.length * 0.6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Response Time</span>
                          <span className="font-bold text-indigo-600">~15 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center - Main Feed */}
                <div className="lg:col-span-6 space-y-4">
                  {allAlerts.length === 0 ? (
                    <div className="py-20 text-center shadcn-card border-dashed">
                      <ShieldAlert size={40} className="mx-auto text-zinc-200 mb-4" />
                      <p className="text-zinc-900 font-medium">No live safety alerts detected in this zone.</p>
                    </div>
                  ) : (
                    <>
                      {allAlerts.slice(0, displayedAlertsCount).map((alert) => (
                        <div key={alert.id} className="shadcn-card overflow-hidden hover:border-zinc-300 transition-all group">
                          {/* Alert Header */}
                          <div className="p-4 flex items-center justify-between border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                                <MapPin size={18} className="text-zinc-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-zinc-900 text-sm">{alert.location}</h4>
                                <p className="text-[10px] text-zinc-500">{new Date(alert.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${alert.type === IssueType.ACCIDENT ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                              {alert.type}
                            </span>
                          </div>

                          {/* Alert Content */}
                          <div className="p-4">
                            <p className="text-sm text-zinc-900 mb-3">{alert.description}</p>
                            <div className="w-full h-64 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                              <img src={alert.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={alert.type} />
                            </div>
                          </div>

                          {/* Feedback Section */}
                          <div className="mx-4 mb-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                            <h5 className="text-xs font-bold text-zinc-900 mb-3">
                              Community Feedback
                            </h5>

                            {alert.feedback ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span key={star} className={`text-sm ${star <= alert.feedback!.rating ? 'text-amber-500' : 'text-zinc-300'}`}>
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-xs text-zinc-600">({alert.feedback.rating}/5)</span>
                                </div>
                                <p className="text-xs text-zinc-700 italic">"{alert.feedback.comment}"</p>
                                <p className="text-[10px] text-zinc-500">Submitted on {new Date(alert.feedback.submittedAt).toLocaleDateString()}</p>
                              </div>
                            ) : (
                              <FeedbackForm alertId={alert.id} />
                            )}
                          </div>

                          {/* Alert Footer */}
                          <div className="px-4 pb-4 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1.5 text-zinc-600">
                                <Clock size={14} /> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${alert.source === 'camera' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-zinc-100 text-zinc-700'}`}>
                                {alert.source === 'camera' ? 'AI Camera' : 'Citizen'}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${alert.status === AlertStatus.PENDING ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                              {alert.status || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Load More Button */}
                      {displayedAlertsCount < allAlerts.length && (
                        <div className="flex justify-center pt-4">
                          <button
                            onClick={() => setDisplayedAlertsCount(prev => prev + 10)}
                            className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                          >
                            Load More Issues
                            <RefreshCw size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Safety Broadcast */}
                  <div className="bg-amber-50 border border-amber-100 p-6 rounded-lg flex items-start gap-4">
                    <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-900">Safety Broadcast</h4>
                      <p className="text-xs text-amber-800 leading-relaxed">System syncing active. 24/7 AI monitoring is operational. Report any emergency via the standard municipal channels.</p>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Location Heat Map */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="shadcn-card p-5 sticky top-20">
                    <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                      <MapPin size={16} className="text-indigo-600" />
                      Location Heat Map
                    </h3>

                    {/* Heat Map Visualization */}
                    <div className="aspect-square bg-zinc-50 rounded-lg border border-zinc-200 mb-4 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin size={32} className="mx-auto text-zinc-300 mb-2" />
                          <p className="text-xs text-zinc-500">Interactive Map</p>
                        </div>
                      </div>
                      {/* Heat spots overlay */}
                      <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-red-500 rounded-full opacity-20 blur-xl"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-amber-500 rounded-full opacity-20 blur-lg"></div>
                      <div className="absolute top-1/2 left-1/2 w-10 h-10 bg-indigo-500 rounded-full opacity-20 blur-lg"></div>
                    </div>

                    {/* Top Locations */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Hotspot Areas</p>
                      {allAlerts.slice(0, 5).map((alert, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg transition-colors">
                          <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-zinc-900 truncate">{alert.location}</p>
                            <p className="text-[10px] text-zinc-500">{alert.type}</p>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400">{idx + 1}</span>
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Severity</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-xs text-zinc-900">High Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-xs text-zinc-900">Medium Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                          <span className="text-xs text-zinc-900">Low Risk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="py-12 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-900 font-bold uppercase tracking-[0.3em]">Nagrik Civic Engine • 1.0.2 Stable Build</p>
        </footer>
      </div>
    </>
  );
}
