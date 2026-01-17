'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera } from '@/types';
import { api } from '@/lib/api';
import { Video, RefreshCw, Power, Circle, Play, Pause, AlertCircle, Cpu, Settings, Radio, Plus, X, Cloud } from 'lucide-react';
import * as tmImage from '@teachablemachine/image';
import { IssueType } from '@/types';

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

const CamerasPage: React.FC = () => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [lastDetection, setLastDetection] = useState<DetectionResult | null>(null);
    const [tmModel, setTmModel] = useState<tmImage.CustomMobileNet | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCameraData, setNewCameraData] = useState({ name: '', location: '', streamUrl: '' });
    const [useAi, setUseAi] = useState(true);
    const [persistentThreat, setPersistentThreat] = useState<{
        type: IssueType;
        startTime: number;
        hasAlerted: boolean;
    } | null>(null);

    const addLog = (msg: string) => {
        console.log(`[CameraSystem] ${msg}`);
    };

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const remoteImageRef = useRef<HTMLImageElement>(null);

    // Teachable Machine Model Mapping
    const labelToIssueType: Record<string, IssueType | null> = {
        "traffic": IssueType.TRAFFIC,
        "accident": IssueType.ACCIDENT,
        "garbage": IssueType.GARBAGE,
        "pothole": IssueType.POTHOLE
    };

    const fetchCameras = async () => {
        setLoading(true);
        const data = await api.getCameras();
        setCameras(data);
        setLoading(false);
    };

    useEffect(() => {
        addLog("Initializing Camera System...");
        fetchCameras();
        loadTMModel(); // Auto-load model
    }, []);

    // Handle adding new camera
    const handleAddCamera = async () => {
        if (!newCameraData.name || !newCameraData.location) {
            alert("Please fill in name and location");
            return;
        }

        const added = await api.addCamera({
            name: newCameraData.name,
            location: newCameraData.location,
            streamUrl: newCameraData.streamUrl,
            ip: '0.0.0.0' // Placeholder
        });

        if (added) {
            setCameras(prev => [...prev, added]);
            setShowAddModal(false);
            setNewCameraData({ name: '', location: '', streamUrl: '' });
            addLog(`New camera added: ${added.name}`);
        }
    };

    // Handle stream URL update with persistence
    const handleUpdateStreamUrl = async (id: string, streamUrl: string) => {
        setCameras(prev => prev.map(c => c.id === id ? { ...c, streamUrl } : c));

        // Only update selected camera if it matches the ID
        if (selectedCamera?.id === id) {
            // If monitoring, we might need to restart or just update the src
            // But we don't want to trigger a full state refresh that kills the monitoring
            setSelectedCamera(prev => prev ? { ...prev, streamUrl } : null);
            addLog(`Stream URL updated for active camera: ${streamUrl}`);
        }

        // Persist to backend
        await api.updateCamera(id, { streamUrl });
    };

    // Handle source type update
    const handleUpdateSourceType = async (id: string, sourceType: 'webcam' | 'remote') => {
        setCameras(prev => prev.map(c => c.id === id ? { ...c, sourceType } : c));
        if (selectedCamera?.id === id) {
            if (isMonitoring && sourceType !== selectedCamera.sourceType) {
                stopMonitoring();
            }
            setSelectedCamera({ ...selectedCamera, sourceType });
        }

        // Persist to backend
        await api.updateCamera(id, { sourceType });
    };

    const toggleCameraStatus = async (id: string, currentStatus: 'online' | 'offline') => {
        const newStatus = currentStatus === 'online' ? 'offline' : 'online';
        const updated = await api.updateCameraStatus(id, newStatus);
        if (updated) {
            setCameras(prev => prev.map(c => c.id === id ? updated : c));
            if (selectedCamera?.id === id) setSelectedCamera(updated);
        }
    };

    // Start webcam
    const startWebcam = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            addLog("ERROR: Browser does not support getUserMedia");
            alert("Your browser doesn't support camera access or is blocked by an insecure connection (use localhost or HTTPS).");
            return false;
        }

        addLog("Requesting webcam access...");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "environment" // Try back camera first for mobile
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Wait for video to be ready
                await new Promise((resolve) => {
                    if (videoRef.current) videoRef.current.onloadedmetadata = resolve;
                });
                addLog("Webcam stream started and metadata loaded.");
                return true;
            }
            return false;
        } catch (error: any) {
            addLog(`ERROR: Could not access webcam - ${error.name}: ${error.message}`);
            if (error.name === 'NotAllowedError') {
                alert('Camera access denied. Please enable permissions in your browser settings.');
            } else {
                alert(`Could not access webcam: ${error.message}`);
            }
            return false;
        }
    };

    // Stop webcam
    const stopWebcam = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            addLog("Stopping webcam stream.");
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Load Teachable Machine Model
    const loadTMModel = async () => {
        if (tmModel) return;
        setIsModelLoading(true);
        addLog("Loading Teachable Machine model...");
        try {
            const modelURL = "/models/my_model/model.json";
            const metadataURL = "/models/my_model/metadata.json";
            const loadedModel = await tmImage.load(modelURL, metadataURL);
            setTmModel(loadedModel);
            addLog("Teachable Machine Model Loaded.");
        } catch (error) {
            addLog(`ERROR: Failed to load TM model - ${error}`);
            alert("Failed to load local model. Ensure files are in public/models/my_model/");
        } finally {
            setIsModelLoading(false);
        }
    };

    // Capture frame and process
    const captureAndProcess = async () => {
        if (!selectedCamera || !canvasRef.current || !useAi) return;

        const canvas = canvasRef.current;
        let source: HTMLVideoElement | HTMLImageElement | null = null;

        if (selectedCamera.sourceType === 'webcam') {
            source = videoRef.current;
        } else {
            source = remoteImageRef.current;
        }

        if (!source) return;

        // Check if source is ready
        if (selectedCamera.sourceType === 'webcam') {
            const video = source as HTMLVideoElement;
            if (video.readyState < 2) return; // Not enough data
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

        if (!tmModel) return;

        try {
            setAiError(null);
            // Predict using canvas
            const predictions = await tmModel.predict(canvas);

            // Find highest probability prediction
            const topPrediction = predictions.reduce((prev, current) =>
                (prev.probability > current.probability) ? prev : current
            );

            setLastDetection({
                alertCreated: false,
                detections: predictions.map(p => ({
                    label: p.className,
                    confidence: p.probability,
                    top: 0, left: 0, width: canvas.width, height: canvas.height
                })),
                message: `AI sees: ${topPrediction.className} (${Math.round(topPrediction.probability * 100)}%)`
            });

            if (topPrediction.probability > 0.7) {
                const issueType = labelToIssueType[topPrediction.className.toLowerCase().trim()];
                if (issueType) {
                    addLog(`HIGH CONFIDENCE: ${issueType} (${Math.round(topPrediction.probability * 100)}%)`);

                    // Logic for 2-minute persistence
                    setPersistentThreat(prev => {
                        const now = Date.now();

                        // If it's a new threat or a different type, start a new timer
                        if (!prev || prev.type !== issueType) {
                            addLog(`Starting persistence timer for: ${issueType}`);
                            return { type: issueType, startTime: now, hasAlerted: false };
                        }

                        // If already alerted for this persistent threat, do nothing
                        if (prev.hasAlerted) return prev;

                        // Check if 2 minutes (120000ms) have passed
                        const elapsed = now - prev.startTime;
                        if (elapsed >= 30000) {
                            addLog(`PERSISTENCE REACHED (2m): Creating server alert for ${issueType}`);

                            // IIFE to handle async alert creation without blocking state update
                            (async () => {
                                try {
                                    await api.submitDetection(
                                        selectedCamera.id,
                                        imageData,
                                        issueType,
                                        topPrediction.probability
                                    );
                                    setLastDetection({
                                        alertCreated: true,
                                        detections: [{
                                            label: topPrediction.className,
                                            confidence: topPrediction.probability,
                                            top: 0, left: 0, width: canvas.width, height: canvas.height
                                        }],
                                        message: `Persistent Alert Created: ${issueType}`
                                    });
                                } catch (e) {
                                    addLog(`Error submitting persistent alert: ${e}`);
                                }
                            })();

                            return { ...prev, hasAlerted: true };
                        }

                        // Still waiting for 2 minutes
                        const remaining = Math.ceil((120000 - elapsed) / 1000);
                        addLog(`Waiting for ${issueType} persistence: ${remaining}s left`);

                        setLastDetection({
                            alertCreated: false,
                            detections: [{
                                label: topPrediction.className,
                                confidence: topPrediction.probability,
                                top: 0, left: 0, width: canvas.width, height: canvas.height
                            }],
                            message: `Threat detected. Persistence waiting: ${remaining}s`
                        });

                        return prev;
                    });
                }
            } else {
                // Confidence dropped or no threat, reset persistence
                if (persistentThreat) {
                    addLog("Threat cleared or confidence dropped. Resetting persistence timer.");
                    setPersistentThreat(null);
                }
            }
        } catch (error: any) {
            setAiError(`Detection error: ${error.message || error}`);
        }
    };

    // Start monitoring
    const startMonitoring = async () => {
        if (!selectedCamera) return;

        addLog(`Initiating monitoring for ${selectedCamera.sourceType} camera: ${selectedCamera.name}`);

        if (selectedCamera.sourceType === 'webcam') {
            const success = await startWebcam();
            if (!success) {
                addLog("Aborting monitoring start due to webcam failure.");
                return;
            }
        }

        setIsMonitoring(true);
        setAiError(null);

        // Process frames every 3 seconds
        monitoringIntervalRef.current = setInterval(() => {
            captureAndProcess();
        }, 3000);

        addLog("Monitoring interval started (3s).");
    };

    // Stop monitoring
    const stopMonitoring = () => {
        addLog("Stopping monitoring.");
        setIsMonitoring(false);

        if (selectedCamera?.sourceType === 'webcam') {
            stopWebcam();
        }

        if (monitoringIntervalRef.current) {
            clearInterval(monitoringIntervalRef.current);
            monitoringIntervalRef.current = null;
        }

        setPersistentThreat(null);
    };

    useEffect(() => {
        return () => {
            stopMonitoring();
        };
    }, []);

    const onlineCameras = cameras.filter(c => c.status === 'online').length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Camera Network</h1>
                    <p className="text-zinc-500 mt-1">Monitor AI-powered surveillance cameras with ML detection</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm"
                    >
                        <Plus size={16} />
                        Add Camera
                    </button>
                    <button
                        onClick={fetchCameras}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 transition-all shadow-sm"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="shadcn-card p-6">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Cameras</p>
                    <p className="text-3xl font-bold text-zinc-900 mt-2">{cameras.length}</p>
                </div>
                <div className="shadcn-card p-6">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Online</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{onlineCameras}</p>
                </div>
                <div className="shadcn-card p-6">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Offline</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{cameras.length - onlineCameras}</p>
                </div>
            </div>

            {/* Camera Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cameras.map((camera) => (
                    <div
                        key={camera.id}
                        className={`shadcn-card p-6 cursor-pointer transition-all ${selectedCamera?.id === camera.id ? 'ring-2 ring-indigo-500 border-indigo-200' : 'hover:border-zinc-300'
                            }`}
                        onClick={() => setSelectedCamera(camera)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${camera.status === 'online' ? 'bg-indigo-50' : 'bg-zinc-100'}`}>
                                    <Video size={20} className={camera.status === 'online' ? 'text-indigo-600' : 'text-zinc-400'} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900">{camera.name}</h3>
                                    <p className="text-xs text-zinc-500">{camera.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Circle
                                    size={8}
                                    className={`${camera.status === 'online' ? 'text-indigo-600 fill-indigo-600 animate-pulse' : 'text-zinc-400 fill-zinc-400'}`}
                                />
                                <span className={`text-xs font-bold uppercase ${camera.status === 'online' ? 'text-indigo-600' : 'text-zinc-400'}`}>
                                    {camera.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-zinc-600 mb-4">
                            <p><strong>Location:</strong> {camera.location}</p>
                            <div className="space-y-3">
                                <div className="flex bg-zinc-100 p-1 rounded-lg w-full">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateSourceType(camera.id, 'webcam');
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1 rounded-md text-[10px] font-bold transition-all ${camera.sourceType === 'webcam' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500'
                                            }`}
                                    >
                                        <Radio size={12} /> Webcam
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateSourceType(camera.id, 'remote');
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1 rounded-md text-[10px] font-bold transition-all ${camera.sourceType === 'remote' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500'
                                            }`}
                                    >
                                        <Cloud size={12} /> Remote
                                    </button>
                                </div>
                                {camera.sourceType === 'remote' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Remote Stream URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                defaultValue={camera.streamUrl || ''}
                                                onBlur={(e) => {
                                                    if (e.target.value !== camera.streamUrl) {
                                                        handleUpdateStreamUrl(camera.id, e.target.value);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleUpdateStreamUrl(camera.id, (e.target as HTMLInputElement).value);
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="e.g. http://192.168.1.18:4747/mjpegfeed"
                                                className="flex-1 bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs font-mono outline-none focus:border-indigo-500"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                    handleUpdateStreamUrl(camera.id, input.value);
                                                }}
                                                className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700"
                                            >
                                                SET
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p><strong>Last Ping:</strong> {new Date(camera.lastPing).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleCameraStatus(camera.id, camera.status);
                            }}
                            className={`w-full py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${camera.status === 'online'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                }`}
                        >
                            <Power size={16} />
                            {camera.status === 'online' ? 'Take Offline' : 'Bring Online'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Live Monitoring */}
            {selectedCamera && (
                <div className="shadcn-card p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <h3 className="font-bold text-zinc-900">Live AI Monitoring: {selectedCamera.name}</h3>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <Cpu size={14} className="text-indigo-600" />
                                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Local Engine Active</span>
                            </div>
                        </div>
                        <button
                            onClick={isMonitoring ? stopMonitoring : startMonitoring}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${isMonitoring
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                        >
                            {isMonitoring ? <><Pause size={16} /> Stop Monitoring</> : <><Play size={16} /> Start Monitoring</>}
                        </button>
                    </div>

                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-zinc-100">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setUseAi(!useAi)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useAi ? 'bg-indigo-600' : 'bg-zinc-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAi ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <div>
                                <p className="text-sm font-bold text-zinc-900">AI Detection Loop</p>
                                <p className="text-xs text-zinc-500">{useAi ? 'Predicting threats every 3s' : 'Stream only (CORS compatible)'}</p>
                            </div>
                        </div>
                    </div>

                    {!tmModel && !isModelLoading && (
                        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Settings className="text-indigo-600" />
                                <div>
                                    <p className="text-sm font-bold text-zinc-900">Teachable Machine Integration</p>
                                    <p className="text-xs text-zinc-600">Load your local model from /public/models/my_model/</p>
                                </div>
                            </div>
                            <button
                                onClick={loadTMModel}
                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                            >
                                Load Model
                            </button>
                        </div>
                    )}

                    {isModelLoading && (
                        <div className="mb-6 p-4 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center gap-3">
                            <RefreshCw size={16} className="animate-spin text-zinc-400" />
                            <p className="text-xs font-bold text-zinc-600 italic">Initializing local AI engine...</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Video Feed */}
                        <div className="lg:col-span-2">
                            <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden relative">
                                {selectedCamera.sourceType === 'webcam' ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                ) : selectedCamera.streamUrl ? (
                                    <img
                                        ref={remoteImageRef}
                                        src={selectedCamera.streamUrl}
                                        crossOrigin={useAi ? "anonymous" : undefined}
                                        alt="Camera Stream"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const msg = `ERROR: Failed to load stream image. URL: ${e.currentTarget.src}`;
                                            addLog(msg);
                                            setAiError("Stream Load Failed. If using DroidCam, ensure the URL is correct and try disabling 'AI Detection Loop' if you see a CORS block.");
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                                        <div className="p-4 bg-zinc-800 rounded-full">
                                            <Video size={32} className="opacity-20" />
                                        </div>
                                        <div className="text-center px-6">
                                            <p className="font-bold text-sm">No Stream URL Provided</p>
                                            <p className="text-xs opacity-60 mt-1">Please enter a valid MJPEG stream URL in the camera card below to see live footage.</p>
                                        </div>
                                    </div>
                                )}
                                <canvas ref={canvasRef} className="hidden" />

                                {isMonitoring && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                        <Circle size={8} className="fill-white animate-pulse" />
                                        MONITORING
                                    </div>
                                )}

                                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm text-white p-3 rounded-lg">
                                    <p className="text-sm font-medium">{selectedCamera.location}</p>
                                    <p className="text-xs text-zinc-300">{new Date().toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detection Results */}
                        <div className="space-y-4">
                            <div className="shadcn-card p-4">
                                <h4 className="font-bold text-zinc-900 mb-3 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Detection Status
                                </h4>

                                {!isMonitoring ? (
                                    <p className="text-sm text-zinc-500">Start monitoring to see detections</p>
                                ) : aiError ? (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                                        <div className="flex items-center gap-2 mb-2 font-bold uppercase text-[10px] tracking-widest">
                                            <AlertCircle size={14} />
                                            Connection Failure
                                        </div>
                                        <p className="text-xs leading-relaxed">{aiError}</p>

                                        <div className="mt-4 pt-4 border-t border-red-100 flex flex-col gap-2">
                                            <p className="text-[10px] uppercase font-bold text-red-400">Troubleshooting Steps:</p>
                                            <ul className="text-[10px] space-y-1 list-disc pl-4 text-red-500">
                                                <li>Verify DroidCam is running and <strong>"IP Cam Access"</strong> is active</li>
                                                <li>Ensure phone and PC are on the <strong>same Wi-Fi network</strong></li>
                                                <li>Try disabling <strong>"AI Detection Loop"</strong> (fixes CORS blocks)</li>
                                                <li><strong>CRITICAL</strong>: URL must end in <strong>/mjpegfeed</strong> (for DroidCam)</li>
                                            </ul>

                                            <div className="mt-2 p-2 bg-indigo-50 border border-indigo-100 rounded text-[10px] text-indigo-700 font-mono">
                                                Suggestion: http://192.168.1.18:4747/mjpegfeed
                                            </div>

                                            <a
                                                href={selectedCamera.streamUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2 text-center px-4 py-2 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-all mb-1"
                                            >
                                                TEST URL IN NEW TAB
                                            </a>
                                            <p className="text-[10px] text-zinc-500 italic text-center">If you don't see video in the new tab, your PC cannot reach the phone.</p>
                                        </div>
                                    </div>
                                ) : lastDetection ? (
                                    <div className="space-y-3">
                                        <div className={`px-3 py-2 rounded-lg ${lastDetection.alertCreated ? 'bg-red-50 border border-red-200' : 'bg-zinc-50 border border-zinc-200'
                                            }`}>
                                            <p className="text-xs font-bold text-zinc-500 uppercase">Status</p>
                                            <p className={`text-sm font-bold ${lastDetection.alertCreated ? 'text-red-600' : 'text-zinc-600'}`}>
                                                {lastDetection.alertCreated ? 'Alert Created!' : persistentThreat ? 'Persistence Check...' : 'No Threats Detected'}
                                            </p>
                                        </div>

                                        {persistentThreat && !persistentThreat.hasAlerted && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                                    <span>Validating Persistent Threat</span>
                                                    <span>{Math.max(0, Math.ceil((120000 - (Date.now() - persistentThreat.startTime)) / 1000))}s</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-500 transition-all duration-300"
                                                        style={{ width: `${Math.min(100, ((Date.now() - persistentThreat.startTime) / 120000) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {lastDetection.detections && lastDetection.detections.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Detections</p>
                                                <div className="space-y-2">
                                                    {lastDetection.detections.map((detection, idx) => (
                                                        <div key={idx} className="bg-zinc-50 p-2 rounded border border-zinc-200">
                                                            <p className="text-sm font-bold text-zinc-900">{detection.label || detection.class}</p>
                                                            <p className="text-xs text-zinc-600">
                                                                Confidence: {Math.round((detection.confidence || 0) * 100)}%
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {lastDetection.message && (
                                            <p className="text-xs text-zinc-500 italic">{lastDetection.message}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-500">Processing frames...</p>
                                )}
                            </div>

                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                <p className="text-xs font-bold text-amber-900 mb-1">ML Model Active</p>
                                <p className="text-xs text-amber-800">
                                    Frames are processed every 3 seconds through your ML detection model.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Camera Modal */}
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
                                <p className="text-[10px] text-zinc-400 mt-1 italic">
                                    You can always update this URL later from the camera card.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold text-sm hover:bg-white/50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCamera}
                                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg"
                            >
                                Register Camera
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CamerasPage;
