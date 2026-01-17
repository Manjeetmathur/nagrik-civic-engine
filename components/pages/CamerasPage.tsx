'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, IssueType } from '@/types';
import { api } from '@/lib/api';
import { Video, RefreshCw, Power, Circle, Play, Pause, AlertCircle, Cpu, Radio, Plus, X, Cloud } from 'lucide-react';
import * as tmImage from '@teachablemachine/image';

interface Detection {
    label?: string;
    class?: string;
    confidence: number;
    top: number;
    left: number;
    width: number;
    height: number;
}

interface DetectionResult {
    alertCreated: boolean;
    detections: Detection[];
    message?: string;
}

const labelToIssueType: Record<string, IssueType | null> = {
    "traffic": IssueType.TRAFFIC,
    "accident": IssueType.ACCIDENT,
    "garbage": IssueType.GARBAGE,
    "pothole": IssueType.POTHOLE,
    "normal": null,
    "background": null,
    "neutral": null,
    "nothing": null
};

// --- Sub-component: CameraMonitorCard ---

interface CameraMonitorCardProps {
    camera: Camera;
    tmModel: tmImage.CustomMobileNet | null;
    onUpdateStreamUrl: (id: string, url: string) => void;
    onUpdateSourceType: (id: string, type: 'webcam' | 'remote') => void;
    onToggleStatus: (id: string, status: 'online' | 'offline') => void;
}

const CameraMonitorCard: React.FC<CameraMonitorCardProps> = ({
    camera,
    tmModel,
    onUpdateStreamUrl,
    onUpdateSourceType,
    onToggleStatus
}) => {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [useAi, setUseAi] = useState(true);
    const [lastDetection, setLastDetection] = useState<DetectionResult | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const [persistentThreat, setPersistentThreat] = useState<{
        type: IssueType;
        startTime: number;
        hasAlerted: boolean;
    } | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const remoteImageRef = useRef<HTMLImageElement>(null);
    const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const addLog = (msg: string) => {
        console.log(`[Camera ${camera.name}] ${msg}`);
    };

    const startWebcam = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "environment" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await new Promise((resolve) => {
                    if (videoRef.current) videoRef.current.onloadedmetadata = resolve;
                });
                return true;
            }
            return false;
        } catch (e) {
            addLog(`Webcam Error: ${e}`);
            return false;
        }
    };

    const stopWebcam = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const captureAndProcess = async () => {
        if (!canvasRef.current || !useAi || !tmModel) return;

        const canvas = canvasRef.current;
        let source: HTMLVideoElement | HTMLImageElement | null = null;

        if (camera.sourceType === 'webcam') {
            source = videoRef.current;
        } else {
            source = remoteImageRef.current;
        }

        if (!source) return;

        if (camera.sourceType === 'webcam') {
            const video = source as HTMLVideoElement;
            if (video.readyState < 2) return;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        } else {
            const img = source as HTMLImageElement;
            if (!img.src || !img.complete || img.naturalWidth === 0) return;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        try {
            setAiError(null);
            const predictions = await tmModel.predict(canvas);
            const topPrediction = predictions.reduce((prev, current) =>
                (prev.probability > current.probability) ? prev : current
            );

            const issueType = labelToIssueType[topPrediction.className.toLowerCase().trim()];
            const isNeutral = issueType === null;

            setLastDetection({
                alertCreated: false,
                detections: predictions.map(p => ({
                    label: p.className,
                    confidence: p.probability,
                    top: 0, left: 0, width: canvas.width, height: canvas.height
                })),
                message: isNeutral || topPrediction.probability < 0.5
                    ? `AI Analysis: System Normal (${Math.round(topPrediction.probability * 100)}%)`
                    : `AI Analysis: ${topPrediction.className} detected (${Math.round(topPrediction.probability * 100)}%)`
            });

            if (topPrediction.probability > 0.7 && issueType) {
                setPersistentThreat(prev => {
                    const now = Date.now();
                    if (!prev || prev.type !== issueType) {
                        return { type: issueType, startTime: now, hasAlerted: false };
                    }
                    if (prev.hasAlerted) return prev;
                    if (now - prev.startTime >= 30000) {
                        api.submitDetection(camera.id, imageData, issueType, topPrediction.probability);
                        setLastDetection(d => d ? { ...d, alertCreated: true, message: `Persistent Alert Created: ${issueType}` } : d);
                        return { ...prev, hasAlerted: true };
                    }
                    return prev;
                });
            } else if (topPrediction.probability < 0.5 || isNeutral) {
                setPersistentThreat(null);
            }
        } catch (error: any) {
            setAiError(`Detection error: ${error.message || error}`);
        }
    };

    const startMonitoring = async () => {
        if (camera.sourceType === 'webcam') {
            const success = await startWebcam();
            if (!success) return;
        }
        setIsMonitoring(true);
        setAiError(null);
        monitoringIntervalRef.current = setInterval(captureAndProcess, 3000);
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
        if (camera.sourceType === 'webcam') stopWebcam();
        if (monitoringIntervalRef.current) {
            clearInterval(monitoringIntervalRef.current);
            monitoringIntervalRef.current = null;
        }
        setPersistentThreat(null);
    };

    useEffect(() => {
        return () => stopMonitoring();
    }, []);

    const remainingPersistence = persistentThreat
        ? Math.max(0, Math.ceil((30000 - (Date.now() - persistentThreat.startTime)) / 1000))
        : 0;

    return (
        <div className={`shadcn-card p-4 transition-all ${isMonitoring ? 'ring-2 ring-indigo-500 border-indigo-200' : 'hover:border-zinc-300'}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${camera.status === 'online' ? 'bg-indigo-50' : 'bg-zinc-100'}`}>
                        <Video size={18} className={camera.status === 'online' ? 'text-indigo-600' : 'text-zinc-400'} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-zinc-900">{camera.name}</h3>
                        <p className="text-[10px] text-zinc-500">{camera.location}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                        <Circle size={6} className={`${camera.status === 'online' ? 'text-indigo-600 fill-indigo-600 animate-pulse' : 'text-zinc-400 fill-zinc-400'}`} />
                        <span className={`text-[10px] font-bold uppercase ${camera.status === 'online' ? 'text-indigo-600' : 'text-zinc-400'}`}>{camera.status}</span>
                    </div>
                </div>
            </div>

            {/* Live Feed Panel */}
            <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden relative mb-4">
                {isMonitoring ? (
                    camera.sourceType === 'webcam' ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : camera.streamUrl ? (
                        <img
                            ref={remoteImageRef}
                            src={camera.streamUrl}
                            crossOrigin={useAi ? "anonymous" : undefined}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const msg = `ERROR: Failed to load stream image. URL: ${e.currentTarget.src}`;
                                console.log(msg);
                                setAiError("Stream Load Failed. Check URL or try disabling 'AI Loop' if using DroidCam.");
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                            <Cloud size={24} className="opacity-20" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No Stream URL</p>
                        </div>
                    )
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                        <Video size={24} className="opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Feed Standby</p>
                    </div>
                )}
                <canvas ref={canvasRef} className="hidden" />

                {isMonitoring && !aiError && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1 shadow-lg ring-1 ring-white/20">
                        <Circle size={6} className="fill-white animate-pulse" /> AI MONITORING
                    </div>
                )}

                {aiError && (
                    <div className="absolute inset-0 bg-red-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center overflow-y-auto">
                        <AlertCircle size={24} className="text-white mb-2" />
                        <p className="text-[12px] text-white font-bold mb-3">{aiError}</p>

                        <div className="w-full space-y-2 text-left bg-black/40 p-3 rounded-lg border border-white/10">
                            <p className="text-[9px] uppercase font-bold text-red-300 tracking-wider">Troubleshooting:</p>
                            <ul className="text-[9px] space-y-1 list-disc pl-4 text-zinc-300">
                                <li>Ensure phone and PC are on <strong>same Wi-Fi</strong></li>
                                <li>Verify DroidCam <strong>"IP Cam Access"</strong> is ON</li>
                                <li>Disable <strong>"AI Loop"</strong> below to fix CORS</li>
                                <li>URL must end in <strong>/mjpegfeed</strong></li>
                            </ul>
                            <a
                                href={camera.streamUrl}
                                target="_blank"
                                className="block mt-2 text-center py-1.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold rounded border border-white/20 transition-all uppercase"
                            >
                                Test URL in New Tab
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls & Status */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <button
                        onClick={isMonitoring ? stopMonitoring : startMonitoring}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg font-bold text-xs transition-all ${isMonitoring
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {isMonitoring ? <><Pause size={14} /> Stop</> : <><Play size={14} /> Start Feed</>}
                    </button>
                    <button
                        onClick={() => onToggleStatus(camera.id, camera.status)}
                        className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200"
                        title={camera.status === 'online' ? 'Take Offline' : 'Bring Online'}
                    >
                        <Power size={14} />
                    </button>
                </div>

                {isMonitoring && (
                    <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setUseAi(!useAi)}
                                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${useAi ? 'bg-indigo-600' : 'bg-zinc-300'}`}
                                >
                                    <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${useAi ? 'translate-x-3.5' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase">AI Loop</span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${lastDetection?.alertCreated ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {lastDetection?.alertCreated ? 'INCIDENT' : 'HEALTHY'}
                            </span>
                        </div>

                        {lastDetection && (
                            <div className="pt-2 border-t border-zinc-200/50">
                                <p className="text-[11px] font-semibold text-zinc-900 leading-tight">{lastDetection.message}</p>

                                {persistentThreat && !persistentThreat.hasAlerted && (
                                    <div className="mt-2 space-y-1.5">
                                        <div className="flex justify-between text-[9px] font-bold text-amber-600 uppercase tracking-tighter">
                                            <span>Analyzing: {persistentThreat.type}</span>
                                            <span>{remainingPersistence}s left</span>
                                        </div>
                                        <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 transition-all duration-300"
                                                style={{ width: `${((30000 - remainingPersistence * 1000) / 30000) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!lastDetection && useAi && (
                            <p className="text-[10px] text-zinc-400 italic">Initializing vision engine...</p>
                        )}
                    </div>
                )}

                {/* Settings Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <div className="flex gap-1 bg-zinc-100 p-0.5 rounded-md">
                        <button
                            onClick={() => onUpdateSourceType(camera.id, 'webcam')}
                            className={`p-1 rounded-sm ${camera.sourceType === 'webcam' ? 'bg-white shadow-xs text-indigo-600' : 'text-zinc-400'}`}
                        >
                            <Radio size={10} />
                        </button>
                        <button
                            onClick={() => onUpdateSourceType(camera.id, 'remote')}
                            className={`p-1 rounded-sm ${camera.sourceType === 'remote' ? 'bg-white shadow-xs text-indigo-600' : 'text-zinc-400'}`}
                        >
                            <Cloud size={10} />
                        </button>
                    </div>
                    <div className="flex-1 ml-2">
                        {camera.sourceType === 'remote' && (
                            <input
                                type="text"
                                defaultValue={camera.streamUrl}
                                onBlur={(e) => onUpdateStreamUrl(camera.id, e.target.value)}
                                placeholder="Stream URL..."
                                className="w-full bg-transparent text-[10px] text-zinc-500 font-mono outline-none border-b border-transparent focus:border-indigo-300 px-1"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const CamerasPage: React.FC = () => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [tmModel, setTmModel] = useState<tmImage.CustomMobileNet | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCameraData, setNewCameraData] = useState({ name: '', location: '', streamUrl: '' });

    const fetchCameras = async () => {
        setLoading(true);
        const data = await api.getCameras();
        setCameras(data);
        setLoading(false);
    };

    const loadTMModel = async () => {
        if (tmModel) return;
        setIsModelLoading(true);
        try {
            const loadedModel = await tmImage.load("/models/my_model/model.json", "/models/my_model/metadata.json");
            setTmModel(loadedModel);
        } catch (e) {
            console.error("Failed to load TM model", e);
        } finally {
            setIsModelLoading(false);
        }
    };

    useEffect(() => {
        fetchCameras();
        loadTMModel();
    }, []);

    const handleUpdateStreamUrl = async (id: string, streamUrl: string) => {
        setCameras(prev => prev.map(c => c.id === id ? { ...c, streamUrl } : c));
        await api.updateCamera(id, { streamUrl });
    };

    const handleUpdateSourceType = async (id: string, sourceType: 'webcam' | 'remote') => {
        setCameras(prev => prev.map(c => c.id === id ? { ...c, sourceType } : c));
        await api.updateCamera(id, { sourceType });
    };

    const toggleCameraStatus = async (id: string, currentStatus: 'online' | 'offline') => {
        const newStatus = currentStatus === 'online' ? 'offline' : 'online';
        const updated = await api.updateCameraStatus(id, newStatus);
        if (updated) setCameras(prev => prev.map(c => c.id === id ? updated : c));
    };

    const handleAddCamera = async () => {
        if (!newCameraData.name || !newCameraData.location) return;
        const added = await api.addCamera({ ...newCameraData, ip: '0.0.0.0' });
        if (added) {
            setCameras(prev => [...prev, added]);
            setShowAddModal(false);
            setNewCameraData({ name: '', location: '', streamUrl: '' });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Live Surveillance Grid</h1>
                    <p className="text-zinc-500 mt-1">Parallel AI monitoring across all registered camera streams</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm"
                    >
                        <Plus size={16} /> Add Camera
                    </button>
                    <button
                        onClick={fetchCameras}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 transition-all shadow-sm"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    {isModelLoading && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg text-amber-700 text-xs font-bold">
                            <Cpu size={14} className="animate-pulse" /> Loading AI...
                        </div>
                    )}
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cameras.map(camera => (
                    <CameraMonitorCard
                        key={camera.id}
                        camera={camera}
                        tmModel={tmModel}
                        onUpdateStreamUrl={handleUpdateStreamUrl}
                        onUpdateSourceType={handleUpdateSourceType}
                        onToggleStatus={toggleCameraStatus}
                    />
                ))}

                {cameras.length === 0 && !loading && (
                    <div className="col-span-full py-20 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-500">
                        <Video size={48} className="opacity-20 mb-4" />
                        <p className="font-bold">No cameras registered</p>
                        <p className="text-sm">Add a camera to start monitoring</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-zinc-900">Add New Camera</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Camera Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. MG Road Junction"
                                    value={newCameraData.name}
                                    onChange={(e) => setNewCameraData({ ...newCameraData, name: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bangalore, KA"
                                    value={newCameraData.location}
                                    onChange={(e) => setNewCameraData({ ...newCameraData, location: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Remote Stream URL (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="http://192.168.1.10:4747/mjpegfeed"
                                    value={newCameraData.streamUrl}
                                    onChange={(e) => setNewCameraData({ ...newCameraData, streamUrl: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-zinc-50 flex gap-3">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold text-sm hover:bg-white/50 transition-all">Cancel</button>
                            <button onClick={handleAddCamera} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg">Register</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CamerasPage;
