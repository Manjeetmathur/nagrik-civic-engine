'use client';

import { useState, useEffect } from 'react';
import { Alert, IssueType, AlertStatus } from '@/types';
import { api } from '@/lib/api';
import {
  ShieldAlert, Camera, MapPin, Send, RefreshCw,
  CheckCircle, Radio, Navigation, AlertTriangle, Search, X, Clock,
  Mic, Upload, Wind
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet component to avoid SSR issues
const LeafletHeatmap = dynamic(
  () => import('@/components/LeafletHeatmap').then(mod => ({ default: mod.LeafletHeatmap })),
  { ssr: false }
);
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { FeedbackForm } from '@/components/FeedbackForm';
import { ref, onValue } from "firebase/database";
import { db as firebaseDb } from "@/lib/firebase";

export default function CitizenPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'report' | 'live'>('live');
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
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);
  const [aqi, setAqi] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: IssueType.GARBAGE,
    location: '',
    description: ''
  });

  const [locationLoading, setLocationLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        setFormData(prev => ({ ...prev, location: locationStr }));
        setLocationLoading(false);

        // Optional: reverse geocoding if we had an API key/service, 
        // but coordinates are a good reliable start for municipal response.
      },
      (error) => {
        setLocationLoading(false);
        let msg = "Check permissions or internal error.";
        if (error.code === 1) msg = "Permission denied. Please allow location access.";
        else if (error.code === 2) msg = "Position unavailable.";
        else if (error.code === 3) msg = "Request timed out.";
        alert(`Location Error: ${msg}`);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

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

  useEffect(() => {
    const sensorsRef = ref(firebaseDb, 'devices');
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Just take the first device's AQI for the general display
        const firstDeviceId = Object.keys(data)[0];
        if (firstDeviceId) {
          setAqi(data[firstDeviceId].gas_value || 0);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const getAqiLabel = (val: number) => {
    if (val <= 50) return 'Good';
    if (val <= 100) return 'Satisfactory';
    if (val <= 200) return 'Moderate';
    if (val <= 300) return 'Poor';
    if (val <= 400) return 'Very Poor';
    return 'Severe';
  };

  const getAqiColor = (val: number) => {
    if (val <= 50) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (val <= 100) return 'bg-lime-100 text-lime-700 border-lime-200';
    if (val <= 200) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (val <= 300) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (val <= 400) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-rose-100 text-rose-900 border-rose-300';
  };

  const getAqiProgressColor = (val: number) => {
    if (val <= 50) return 'bg-emerald-500';
    if (val <= 100) return 'bg-lime-500';
    if (val <= 200) return 'bg-yellow-500';
    if (val <= 300) return 'bg-orange-500';
    if (val <= 400) return 'bg-red-500';
    return 'bg-rose-900';
  };

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

    // Validate that an image has been uploaded
    if (!imagePreview) {
      alert("⚠️ Evidence Photo Required\n\nPlease upload a photo of the incident before submitting your report. This helps our team verify and respond to the issue more effectively.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      type: formData.type,
      location: formData.location,
      description: formData.description,
      imageUrl: imagePreview,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-300/50 p-10 text-center animate-in zoom-in-95 duration-500 my-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Report Received</h2>
          <p className="text-base text-slate-600 mb-8 leading-relaxed">Thank you for your vigilance. Our AI-driven maintenance department is now analyzing your submission.</p>
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-6 rounded-xl mb-8 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Live Tracking ID</p>
            <p className="text-2xl font-mono font-bold text-slate-900 tracking-wider">{submissionId}</p>
          </div>
          <button
            onClick={() => { setStep(1); setActiveTab('report'); setImagePreview(null); }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
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
        <div className="fixed top-20 right-6 z-[100] w-80 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-2xl shadow-black/20 border border-white/10 p-4 animate-in slide-in-from-right duration-500">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-r from-rose-600 to-rose-500 p-2.5 rounded-lg shrink-0 shadow-lg shadow-rose-500/30">
              <ShieldAlert size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-100">{toast.type}</p>
                <Clock size={12} className="text-white/40" />
              </div>
              <p className="text-sm font-semibold text-white mb-0.5">{toast.location}</p>
              <p className="text-xs text-white/70 line-clamp-1">{toast.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTrackModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-slate-300/50 animate-in zoom-in-95 duration-300 border border-slate-200 my-auto">
            <button onClick={() => setShowTrackModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><X size={20} /></button>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Track Status</h3>
            <p className="text-base text-slate-600 mb-6">Enter your alphanumeric tracking ID.</p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="TRK-XXXX-XXXX"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="shadcn-input w-full px-4 py-3 text-sm font-mono uppercase tracking-wider"
              />
              <button
                disabled={!trackInput}
                onClick={() => router.push(`/track/${trackInput}`)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Search size={18} /> View Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Map Modal */}
      {showFullscreenMap && (
        <div className="fixed inset-0 z-50 bg-slate-900">
          {/* Header with back button */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900 to-transparent z-10 p-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFullscreenMap(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-white">Interactive Alert Map</h2>
                  <p className="text-sm text-slate-300">Showing {allAlerts.length} active alerts</p>
                </div>
              </div>

              {/* Legend */}
              <div className="hidden md:flex items-center gap-4 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-lg border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-xs text-white">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-white">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-white">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-white">You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="w-full h-full pt-20">
            <LeafletHeatmap
              points={allAlerts
                .filter(alert => alert.reporter?.coordinates)
                .map((alert, idx) => ({
                  lat: alert.reporter!.coordinates!.lat,
                  lng: alert.reporter!.coordinates!.lng,
                  intensity: alert.type === IssueType.ACCIDENT ? 1.0 : idx < 5 ? 0.7 : 0.4
                }))
              }
              userLocation={userLocation}
              className="h-full"
            />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 font-sans">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center    gap-2.5">
                <div className="  mt-2">
                  <img
                    src="/logo.png"
                    alt="Nagrik Logo"
                    className="object-cover h-16"
                  />
                </div>
              </div>

              <nav className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg">
                <button
                  onClick={() => setActiveTab('live')}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${activeTab === 'live' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Radio size={14} className={activeTab === 'live' ? 'animate-pulse' : ''} /> Area Updates
                </button>
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'report' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  File Report
                </button>

                <button
                  onClick={() => router.push('/voice')}
                  className="px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <Mic size={14} /> Voice Recognition
                </button>
              </nav>

              <div className="flex items-center gap-3">
                <button onClick={() => setShowTrackModal(true)} className="hidden md:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Track ID</button>
                <button onClick={() => router.push('/admin')} className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-sm font-semibold rounded-lg shadow-lg shadow-slate-900/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">Admin Access</button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-12">
          {activeTab === 'report' ? (
            <div className="animate-in  fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-12 space-y-3">
                <h2 className="text-4xl md:text-5xl blue-pulse font-bold tracking-tight py-2">Report Safety Incident</h2>
                <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed mt-10">Integrated computer vision processing for automated municipal response</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                  <section>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Camera size={16} className="text-blue-600" /> 1. Upload Visual Evidence
                    </label>
                    <div className={`relative w-full rounded-none overflow-hidden ${imagePreview ? 'h-60 border-2 border-indigo-500' : ''}`}>
                      {imagePreview ? (
                        <div className="relative w-full h-full group">
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          <button type="button" onClick={() => setImagePreview(null)} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
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

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Report Category</label>
                      <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as IssueType })} className="shadcn-input w-full px-4 py-2.5 text-sm">
                        {Object.values(IssueType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Detected Location</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input required type="text" placeholder="Street or Area" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="shadcn-input w-full pl-9 pr-24 py-2.5 text-sm" />
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={locationLoading}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded transition-all disabled:opacity-50"
                        >
                          {locationLoading ? 'Detecting...' : 'Detect'}
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Contextual Description</label>
                      <textarea required rows={3} placeholder="Describe what requires attention..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="shadcn-input w-full px-4 py-2.5 text-sm resize-none"></textarea>
                    </div>
                  </section>

                  <section className="pt-6 border-t border-zinc-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Full Name</label>
                        <input required type="text" placeholder="Your Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="shadcn-input w-full px-4 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Phone Number</label>
                        <input required type="tel" placeholder="+91 XXXX XXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="shadcn-input w-full px-4 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Email Address</label>
                        <input required type="email" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="shadcn-input w-full px-4 py-2 text-sm" />
                      </div>
                    </div>
                  </section>

                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
                {/* Left Sidebar - Issue Tracking System & AQI */}
                <div className="lg:col-span-3">
                  <div className="sticky top-24 space-y-4">
                    {/* Issue Tracking Card */}
                    <div className="shadcn-card p-5">
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

                    {/* AQI Status Card */}
                    <div className="shadcn-card p-5 bg-gradient-to-br from-white to-slate-50">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind size={16} className="text-blue-600" />
                          Air Quality Index
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-bold tracking-wider border ${getAqiColor(aqi || 0)}`}>
                          {getAqiLabel(aqi || 0)}
                        </span>
                      </h3>
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p className="text-4xl font-bold text-slate-900 tracking-tight">{aqi !== null ? Math.round(aqi) : '--'}</p>
                          <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1">PM2.5 Concentration</p>
                        </div>
                        <div className={`w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center -rotate-45 transition-all duration-1000`} style={{ borderTopColor: aqi !== null ? (aqi <= 50 ? '#10b981' : aqi <= 100 ? '#84cc16' : aqi <= 200 ? '#eab308' : aqi <= 300 ? '#f97316' : '#ef4444') : '#f1f5f9' }}>
                          <span className="rotate-45 text-xs font-bold text-slate-600">{(aqi || 0) > 100 ? '100+' : Math.round((aqi || 0) * 0.2)}%</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${getAqiProgressColor(aqi || 0)}`} style={{ width: `${Math.min(100, (aqi || 0) / 5)}%` }} />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          {aqi === null ? 'Loading live environment telemetry...' :
                            aqi <= 50 ? 'Air quality is satisfactory, and air pollution poses little or no risk.' :
                              aqi <= 100 ? 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern.' :
                                aqi <= 200 ? 'Members of sensitive groups may experience health effects.' :
                                  'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center - Main Feed */}
                <div className="lg:col-span-6 space-y-4">
                  {allAlerts.length === 0 ? (
                    <div className="py-20 text-center shadcn-card border-dashed">
                      <ShieldAlert size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-600 font-medium text-base">No live safety alerts detected in this zone.</p>
                    </div>
                  ) : (
                    <>
                      {allAlerts.slice(0, displayedAlertsCount).map((alert) => (
                        <div key={alert.id} className="shadcn-card overflow-hidden hover:border-slate-300 transition-all group">
                          {/* Alert Header */}
                          <div className="p-5 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center border border-slate-200">
                                <MapPin size={20} className="text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900 text-base">{alert.location}</h4>
                                <p className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full ${alert.type === IssueType.ACCIDENT ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                              {alert.type}
                            </span>
                          </div>

                          {/* Alert Content */}
                          <div className="p-5">
                            <p className="text-base text-slate-700 mb-4 leading-relaxed">{alert.description}</p>
                            <div className="w-full h-64 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                              <img src={alert.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" alt={alert.type} />
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
                          <div className="px-5 pb-5 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-2 text-slate-600">
                                <Clock size={16} /> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${alert.source === 'camera' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                {alert.source === 'camera' ? 'AI Camera' : 'Citizen'}
                              </span>
                            </div>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${alert.status === AlertStatus.PENDING ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
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
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                          >
                            Load More Issues
                            <RefreshCw size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Safety Broadcast */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-2 border-amber-200 p-6 rounded-xl flex items-start gap-4 shadow-sm">
                    <div className="bg-amber-500 p-2 rounded-lg">
                      <AlertTriangle className="text-white" size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-amber-900">Safety Broadcast</h4>
                      <p className="text-sm text-amber-800 leading-relaxed">System syncing active. 24/7 AI monitoring is operational. Report any emergency via the standard municipal channels.</p>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Location Heat Map */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="shadcn-card p-5 sticky top-20">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-blue-600" />
                      Location Heat Map
                    </h3>

                    {/* Heat Map Visualization - Leaflet */}
                    <div className="aspect-square rounded-xl border-2 border-slate-200 overflow-hidden shadow-inner relative group">
                      <LeafletHeatmap
                        points={allAlerts
                          .filter(alert => alert.reporter?.coordinates)
                          .map((alert, idx) => ({
                            lat: alert.reporter!.coordinates!.lat,
                            lng: alert.reporter!.coordinates!.lng,
                            intensity: alert.type === IssueType.ACCIDENT ? 1.0 : idx < 3 ? 0.7 : 0.4
                          }))
                        }
                        userLocation={userLocation}
                        onMapClick={() => setShowFullscreenMap(true)}
                        className="cursor-pointer"
                      />

                      {/* Click hint overlay */}
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-[1000] flex items-center gap-1 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                        Expand
                      </div>
                    </div>

                    {/* Top Locations */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Hotspot Areas</p>
                      {allAlerts.length > 0 ? (
                        allAlerts.slice(0, 5).map((alert, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                            <div className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'} group-hover:scale-125 transition-transform`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{alert.location}</p>
                              <p className="text-xs text-slate-500">{alert.type}</p>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">#{idx + 1}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-4">No hotspots detected</p>
                      )}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Severity</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                          <span className="text-sm text-slate-700">High Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-sm text-slate-700">Medium Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-slate-700">Low Risk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main >

        <footer className="py-12 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-900 font-bold uppercase tracking-[0.3em]">Nagrik Civic Engine • 1.0.2 Stable Build</p>
        </footer>
      </div >
    </>
  );
}
