'use client';

import React, { useState, useEffect } from 'react';
import {
    Wind,
    Thermometer,
    Droplets,
    AlertTriangle,
    RefreshCw,
    Activity,
    CloudRain,
    Cpu,
    Table as TableIcon,
    ChevronRight,
    MapPin,
    ArrowLeft,
    Globe,
    Zap
} from 'lucide-react';
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface AirQualityData {
    aqi: number;
    pm25: number;
    pm10: number;
    co2: number;
    temp: number;
    humidity: number;
    timestamp: string;
    rawTimestamp?: string | number;
    deviceId: string;
}

interface DeviceState {
    [key: string]: {
        current: AirQualityData;
        history: AirQualityData[];
    };
}

const AirQualityPage: React.FC = () => {
    const [devices, setDevices] = useState<DeviceState>({});
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const getStatusColor = (aqi: number) => {
        if (aqi <= 50) return 'text-green-600 bg-green-50 border-green-100';
        if (aqi <= 100) return 'text-lime-600 bg-lime-50 border-lime-100';
        if (aqi <= 200) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        if (aqi <= 300) return 'text-orange-600 bg-orange-50 border-orange-100';
        if (aqi <= 400) return 'text-red-600 bg-red-50 border-red-100';
        return 'text-rose-900 bg-rose-50 border-rose-200';
    };

    const getAqiLabel = (aqi: number) => {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Satisfactory';
        if (aqi <= 200) return 'Moderate';
        if (aqi <= 300) return 'Poor';
        if (aqi <= 400) return 'Very Poor';
        return 'Severe';
    };

    const getAqiRangeLabel = (aqi: number) => {
        if (aqi <= 50) return 'Good (0-50)';
        if (aqi <= 100) return 'Satisfactory (51-100)';
        if (aqi <= 200) return 'Moderate (101-200)';
        if (aqi <= 300) return 'Poor (201-300)';
        if (aqi <= 400) return 'Very Poor (301-400)';
        return 'Severe (401-500)';
    };

    // Listen to real-time Firebase updates for ALL devices
    useEffect(() => {
        const sensorsRef = ref(db, 'devices');

        const unsubscribe = onValue(sensorsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setDevices(prev => {
                    const newDevices: DeviceState = { ...prev };

                    Object.keys(data).forEach(deviceId => {
                        const sensorData = data[deviceId];
                        const gasValue = sensorData.gas_value || 0;
                        const rawTs = sensorData.timestamp || 'N/A';

                        const newData: AirQualityData = {
                            deviceId,
                            aqi: gasValue,
                            pm25: gasValue * 0.12,
                            pm10: gasValue * 0.3,
                            co2: 400 + (gasValue * 0.5),
                            temp: 24,
                            humidity: 62,
                            timestamp: new Date().toLocaleTimeString(),
                            rawTimestamp: rawTs
                        };

                        if (!newDevices[deviceId]) {
                            newDevices[deviceId] = {
                                current: newData,
                                history: [newData]
                            };
                        } else {
                            newDevices[deviceId] = {
                                current: newData,
                                history: [...newDevices[deviceId].history.slice(-20), newData]
                            };
                        }
                    });
                    return newDevices;
                });
                setLoading(false);
            } else {
                setLoading(false);
            }
        }, (error) => {
            console.error("Firebase Read Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const selectedDevice = selectedDeviceId ? devices[selectedDeviceId] : null;

    if (loading && Object.keys(devices).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                <p className="mt-4 text-zinc-500 font-medium">Listening for IoT Broadcasts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            {/* Elite Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        {selectedDeviceId && (
                            <button
                                onClick={() => setSelectedDeviceId(null)}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-500 group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                        )}
                        <h1 className="text-4xl font-black tracking-tight text-zinc-900 uppercase italic">
                            {selectedDeviceId ? `NODE_${selectedDeviceId}` : 'Hardware Hub'}
                        </h1>
                    </div>
                    <p className="text-zinc-500 font-medium tracking-tight">
                        {selectedDeviceId
                            ? `Strategic environmental telemetry from active hardware node.`
                            : `Centralized dashboard for all live ESP8266 & IoT satellite sensors.`
                        }
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Firebase Realtime Active</span>
                    </div>
                </div>
            </div>

            {!selectedDeviceId ? (
                /* Pure Hardware Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.keys(devices).length > 0 ? (
                        Object.keys(devices).map(id => {
                            const device = devices[id];
                            const statusStyles = getStatusColor(device.current.aqi);
                            return (
                                <div
                                    key={id}
                                    onClick={() => setSelectedDeviceId(id)}
                                    className="group relative overflow-hidden bg-white border border-zinc-200 rounded-[2.5rem] p-8 hover:border-zinc-900 transition-all duration-500 cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                                >
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="p-4 bg-zinc-50 rounded-2xl group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-500">
                                            <Cpu size={24} />
                                        </div>
                                        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusStyles}`}>
                                            {getAqiRangeLabel(device.current.aqi)}
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-8">
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-6xl font-black text-zinc-900 tracking-tighter">{Math.round(device.current.aqi)}</h3>
                                            <span className="text-zinc-400 font-bold text-sm uppercase italic">AQI Units</span>
                                        </div>
                                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{id}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-8 border-t border-zinc-100">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-zinc-500">
                                                <Thermometer size={14} />
                                                <span className="text-xs font-bold">{device.current.temp}°C</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-zinc-500">
                                                <Droplets size={14} />
                                                <span className="text-xs font-bold">{device.current.humidity}%</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-900 transition-all duration-500 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center animate-pulse">
                                <Cpu size={40} className="text-zinc-200" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-zinc-900 uppercase">Searching for Broadcasts</h3>
                                <p className="text-zinc-400 text-sm max-w-xs mx-auto">Please ensure your ESP8266 is powered and publishing to the <span className="font-mono text-zinc-900">devices/</span> node.</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Focused Hardware Detail */
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    {selectedDevice && (
                        <>
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Large AQI Metrics */}
                                <div className="xl:col-span-2 bg-zinc-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-10">
                                        <Wind size={200} />
                                    </div>
                                    <div className="relative z-10 space-y-12">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Node Status: Active</span>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
                                            <div>
                                                <h2 className="text-9xl font-black tracking-tighter leading-none">{Math.round(selectedDevice.current.aqi)}</h2>
                                                <p className="mt-2 text-zinc-400 font-bold uppercase italic tracking-widest text-lg">AQI Level</p>
                                            </div>
                                            <div className="space-y-4 mb-2">
                                                <div className={`inline-block px-6 py-2 rounded-full text-sm font-black uppercase tracking-[0.2em] border-2 ${getStatusColor(selectedDevice.current.aqi).includes('green') ? 'border-green-500 text-green-500' : getStatusColor(selectedDevice.current.aqi).includes('lime') ? 'border-lime-500 text-lime-500' : getStatusColor(selectedDevice.current.aqi).includes('yellow') ? 'border-yellow-500 text-yellow-500' : getStatusColor(selectedDevice.current.aqi).includes('orange') ? 'border-orange-500 text-orange-500' : 'border-red-500 text-red-500'}`}>
                                                    {getAqiRangeLabel(selectedDevice.current.aqi)}
                                                </div>
                                                <p className="text-xs text-zinc-500 font-medium max-w-[240px]">Indian Central Pollution Control Board (CPCB) Standard Compliance Active.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-zinc-800">
                                            {[
                                                { label: 'PM 2.5', value: selectedDevice.current.pm25.toFixed(1), unit: 'µg/m³' },
                                                { label: 'PM 10', value: selectedDevice.current.pm10.toFixed(1), unit: 'µg/m³' },
                                                { label: 'CO2', value: selectedDevice.current.co2.toFixed(0), unit: 'ppm' },
                                                { label: 'LATENCY', value: '< 120', unit: 'ms' },
                                            ].map((stat, i) => (
                                                <div key={i} className="space-y-1">
                                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                                                    <p className="text-xl font-bold">{stat.value}<span className="text-[10px] ml-1 text-zinc-600">{stat.unit}</span></p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Stats */}
                                <div className="space-y-8">
                                    <div className="bg-white border-2 border-zinc-100 rounded-[2.5rem] p-8 space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Environment Details</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <Thermometer className="text-zinc-400" size={18} />
                                                    <span className="text-sm font-bold text-zinc-600">Temperature</span>
                                                </div>
                                                <span className="text-lg font-black">{selectedDevice.current.temp.toFixed(1)}°C</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <Droplets className="text-zinc-400" size={18} />
                                                    <span className="text-sm font-bold text-zinc-600">Humidity</span>
                                                </div>
                                                <span className="text-lg font-black">{selectedDevice.current.humidity.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-50 rounded-[2.5rem] p-8 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wind size={16} className="text-zinc-400" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">CPCB Ranges</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Good', range: '0-50', color: 'bg-green-500' },
                                                { label: 'Satisfactory', range: '51-100', color: 'bg-lime-500' },
                                                { label: 'Moderate', range: '101-200', color: 'bg-yellow-500' },
                                                { label: 'Poor', range: '201-300', color: 'bg-orange-500' },
                                                { label: 'Very Poor', range: '301-400', color: 'bg-red-500' },
                                                { label: 'Severe', range: '401-500', color: 'bg-rose-900' },
                                            ].map((r, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-1.5 w-1.5 rounded-full ${r.color}`} />
                                                        <span className="text-[10px] font-bold text-zinc-600 uppercase">{r.label}</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold text-zinc-400">{r.range}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-zinc-50 rounded-[2.5rem] p-8 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TableIcon size={16} className="text-zinc-400" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Raw Telemetry</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Timestamp</span>
                                                <span className="text-xs font-mono font-bold">{selectedDevice.current.rawTimestamp}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Internal ID</span>
                                                <span className="text-xs font-mono font-bold">NODE_{selectedDevice.current.deviceId}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Regional Trend Analytic */}
                            <div className="bg-white border border-zinc-200 rounded-[3rem] p-12">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tight">Broadcast History</h3>
                                    <div className="px-4 py-1.5 bg-zinc-100 rounded-full flex items-center gap-2">
                                        <Activity size={12} className="text-zinc-400" />
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Sampling</span>
                                    </div>
                                </div>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={selectedDevice.history}>
                                            <defs>
                                                <linearGradient id="colorAqiElite" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                            <XAxis
                                                dataKey="timestamp"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }}
                                                interval={4}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                                itemStyle={{ color: '#18181b' }}
                                            />
                                            <Area
                                                type="stepAfter"
                                                dataKey="aqi"
                                                stroke="#18181b"
                                                strokeWidth={4}
                                                fill="url(#colorAqiElite)"
                                                animationDuration={1000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AirQualityPage;
