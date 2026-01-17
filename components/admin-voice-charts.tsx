"use client"

import { useEffect, useState } from "react"
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

interface CategoryData {
    name: string
    count: number
}

interface TimeSeriesData {
    hour: number
    count: number
    time: string
}

interface SpeechStressStats {
    totalAnalyzed: number
    averageConfidence: number
    averageWordsPerSecond: number
    highStressCount: number
    confidenceDistribution: {
        low: number
        medium: number
        high: number
    }
    wordsPerSecondRanges: {
        slow: number
        normal: number
        fast: number
    }
}

interface AnalyticsResponse {
    totalReports: number
    categoryData: CategoryData[]
    timeSeriesData: TimeSeriesData[]
    lastReportAt: string | null
    speechStressStats?: SpeechStressStats
}

export function AdminVoiceCharts() {
    const [data, setData] = useState<AnalyticsResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/analytics");
                if (!res.ok) throw new Error("Failed to fetch analytics");
                const data = await res.json();
                setData(data);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!data) {
        return <p className="text-red-500">Failed to load analytics</p>
    }

    const tooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null
        return (
            <div className="bg-white border border-zinc-200 shadow-lg rounded-lg p-3">
                <p className="text-zinc-900 text-sm font-medium">
                    {payload[0].payload.name ?? payload[0].payload.time}
                </p>
                <p className="text-indigo-600 font-semibold text-sm">
                    Reports: {payload[0].value}
                </p>
            </div>
        )
    }

    const confidenceData = data.speechStressStats ? [
        { name: "Low (<40%)", value: data.speechStressStats.confidenceDistribution.low, color: "#22c55e" },
        { name: "Medium (40-60%)", value: data.speechStressStats.confidenceDistribution.medium, color: "#eab308" },
        { name: "High (≥60%)", value: data.speechStressStats.confidenceDistribution.high, color: "#ef4444" },
    ] : []

    const speedData = data.speechStressStats ? [
        { name: "Slow (<1.5)", value: data.speechStressStats.wordsPerSecondRanges.slow, color: "#3b82f6" },
        { name: "Normal (1.5-3.0)", value: data.speechStressStats.wordsPerSecondRanges.normal, color: "#22c55e" },
        { name: "Fast (≥3.0)", value: data.speechStressStats.wordsPerSecondRanges.fast, color: "#ef4444" },
    ] : []

    return (
        <div className="space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Category Bar Chart */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">
                        Reports by Category
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.categoryData}>
                                <CartesianGrid stroke="#f4f4f5" vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} axisLine={false} />
                                <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
                                <Tooltip content={tooltip} cursor={{ fill: '#f4f4f5' }} />
                                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Time Line Chart */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">
                        Reports Over Time
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.timeSeriesData}>
                                <CartesianGrid stroke="#f4f4f5" vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="time" stroke="#a1a1aa" tickLine={false} axisLine={false} />
                                <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
                                <Tooltip content={tooltip} />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: '#06b6d4' }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Speech Stress Confidence Distribution */}
                {data.speechStressStats && data.speechStressStats.totalAnalyzed > 0 && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">
                            Stress Confidence Distribution
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={confidenceData}>
                                    <CartesianGrid stroke="#f4f4f5" vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
                                    <Tooltip content={tooltip} cursor={{ fill: '#f4f4f5' }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#4f46e5" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Speech Speed Distribution */}
                {data.speechStressStats && data.speechStressStats.totalAnalyzed > 0 && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">
                            Speaking Speed Distribution
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={speedData}>
                                    <CartesianGrid stroke="#f4f4f5" vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
                                    <Tooltip content={tooltip} cursor={{ fill: '#f4f4f5' }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#06b6d4" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Total Reports" value={data.totalReports} />
                <Stat
                    label="Avg / Hour"
                    value={data.timeSeriesData.length > 0
                        ? (data.totalReports / data.timeSeriesData.length).toFixed(1)
                        : "0.0"}
                />
                <Stat
                    label="Peak Hour"
                    value={data.timeSeriesData.length > 0
                        ? Math.max(...data.timeSeriesData.map((d) => d.count))
                        : 0}
                />
                <Stat
                    label="Last Report"
                    value={
                        data.lastReportAt
                            ? new Date(data.lastReportAt).toLocaleTimeString()
                            : "N/A"
                    }
                />
            </div>

            {/* Speech Stress Summary */}
            {data.speechStressStats && data.speechStressStats.totalAnalyzed > 0 && (
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">
                        Speech Stress Analysis Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Stat label="Total Analyzed" value={data.speechStressStats.totalAnalyzed} />
                        <Stat label="Avg Confidence" value={`${data.speechStressStats.averageConfidence}%`} />
                        <Stat label="Avg Speed" value={`${data.speechStressStats.averageWordsPerSecond} wps`} />
                        <Stat label="High Stress" value={data.speechStressStats.highStressCount} />
                    </div>
                </div>
            )}
        </div>
    )
}

function Stat({ label, value }: { label: string; value: any }) {
    return (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <p className="text-zinc-500 text-xs mb-2 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-zinc-900">{value}</p>
        </div>
    )
}
