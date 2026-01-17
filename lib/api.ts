import { Alert, AlertStatus, IssueType, Camera } from '@/types';

const API_BASE = '/api';

class ApiService {
    private isLive = false;
    private hasProbed = false;

    private async probe(): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
            this.isLive = res.ok;
        } catch {
            this.isLive = false;
        }
        this.hasProbed = true;
        return this.isLive;
    }

    subscribeToAlerts(onAlert: (alert: Alert) => void) {
        if (!this.isLive && this.hasProbed) return () => { };

        const eventSource = new EventSource(`${API_BASE}/alerts/stream`);

        eventSource.onmessage = (event) => {
            try {
                const alert = JSON.parse(event.data);
                onAlert(alert);
            } catch (e) {
                console.error("Failed to parse alert stream", e);
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => eventSource.close();
    }

    async getAlerts(page: number = 1, limit: number = 20, source?: string): Promise<{ data: Alert[], isLive: boolean }> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            if (source) params.append('source', source);

            const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
            if (res.ok) {
                this.isLive = true;
                const data = await res.json();
                return { data: Array.isArray(data) ? data : [], isLive: true };
            }
        } catch (e) {
            console.error("API Fetch Error:", e);
        }
        this.isLive = false;
        return { data: [], isLive: false };
    }

    async getAlertById(id: string): Promise<Alert | null> {
        try {
            const res = await fetch(`${API_BASE}/alerts/${id}`);
            if (res.ok) return await res.json();
        } catch { }
        return null;
    }

    async submitReport(report: any): Promise<Alert | null> {
        try {
            const res = await fetch(`${API_BASE}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            });
            if (res.ok) return await res.json();
        } catch (e) {
            console.error("Submit Report Error:", e);
        }
        return null;
    }

    async updateStatus(id: string, status: AlertStatus): Promise<Alert | null> {
        try {
            const res = await fetch(`${API_BASE}/alerts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) return await res.json();
            console.error("Update Status Failed", res.status, await res.text());
        } catch (e) {
            console.error("Update Status Exception", e);
        }
        return null;
    }

    async submitFeedback(id: string, rating: number, comment: string) {
        try {
            await fetch(`${API_BASE}/alerts/${id}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
            });
        } catch { }
    }

    async getCameras(): Promise<Camera[]> {
        try {
            const res = await fetch(`${API_BASE}/cameras`);
            if (res.ok) return await res.json();
        } catch { }
        return [];
    }

    async updateCameraStatus(id: string, status: 'online' | 'offline'): Promise<Camera | null> {
        return this.updateCamera(id, { status });
    }

    async addCamera(camera: Partial<Camera>): Promise<Camera | null> {
        try {
            const res = await fetch(`${API_BASE}/cameras`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(camera)
            });
            if (res.ok) return await res.json();
        } catch { }
        return null;
    }

    async updateCamera(id: string, updates: Partial<Camera>): Promise<Camera | null> {
        try {
            const res = await fetch(`${API_BASE}/cameras/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) return await res.json();
        } catch { }
        return null;
    }

    async getAnalyticsSummary(): Promise<any> {
        try {
            const res = await fetch(`${API_BASE}/analytics/summary`);
            if (res.ok) return await res.json();
        } catch { }
        return {
            stats: { activeAlerts: 0, resolvedToday: 0, totalIncidents: 0, onlineCameras: 0, totalCameras: 0 },
            distribution: [],
            statusHealth: [],
            timelineData: []
        };
    }

    async submitDetection(cameraId: string, imageData: string, type: IssueType, confidence: number): Promise<any> {
        try {
            const res = await fetch(`${API_BASE}/camera/detect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cameraId, imageData, type, confidence })
            });
            return await res.json();
        } catch { }
        return { success: false };
    }
}

export const api = new ApiService();
