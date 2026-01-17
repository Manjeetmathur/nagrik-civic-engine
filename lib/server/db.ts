import { Alert, AlertStatus, Camera } from '@/types';
import { mockAlerts, mockCameras } from '@/lib/mockData';

// In-memory database (replace with Prisma when schema is ready)
let alerts: Alert[] = [...mockAlerts];
let cameras: Camera[] = [...mockCameras];

export const db = {
    // Alert operations
    async getAllAlerts(): Promise<Alert[]> {
        return alerts;
    },

    async getAlertById(id: string): Promise<Alert | null> {
        return alerts.find(a => a.id === id) || null;
    },

    async createAlert(alert: Alert): Promise<Alert> {
        alerts = [alert, ...alerts];
        return alert;
    },

    async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
        const index = alerts.findIndex(a => a.id === id);
        if (index === -1) return null;

        alerts[index] = { ...alerts[index], ...updates };
        return alerts[index];
    },

    async addFeedback(id: string, rating: number, comment: string): Promise<Alert | null> {
        const index = alerts.findIndex(a => a.id === id);
        if (index === -1) return null;

        alerts[index].feedback = {
            rating,
            comment,
            submittedAt: new Date().toISOString()
        };
        return alerts[index];
    },

    // Camera operations
    async getAllCameras(): Promise<Camera[]> {
        return cameras;
    },

    async getCameraById(id: string): Promise<Camera | null> {
        return cameras.find(c => c.id === id) || null;
    },

    async updateCameraStatus(id: string, status: 'online' | 'offline'): Promise<Camera | null> {
        return this.updateCamera(id, { status, lastPing: new Date().toISOString() });
    },

    async createCamera(camera: Camera): Promise<Camera> {
        const newCamera = { ...camera, sourceType: camera.sourceType || 'webcam' };
        cameras = [...cameras, newCamera];
        return newCamera;
    },

    async updateCamera(id: string, updates: Partial<Camera>): Promise<Camera | null> {
        const index = cameras.findIndex(c => c.id === id);
        if (index === -1) return null;

        cameras[index] = { ...cameras[index], ...updates };
        return cameras[index];
    },

    // Analytics
    async getAnalyticsSummary() {
        const activeAlerts = alerts.filter(a => a.status === AlertStatus.PENDING).length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedToday = alerts.filter(a =>
            a.status === AlertStatus.RESOLVED &&
            new Date(a.timestamp) >= today
        ).length;
        const totalIncidents = alerts.length;
        const onlineCameras = cameras.filter(c => c.status === 'online').length;
        const totalCameras = cameras.length;

        return {
            stats: {
                activeAlerts,
                resolvedToday,
                totalIncidents,
                onlineCameras,
                totalCameras
            },
            distribution: [],
            statusHealth: [],
            timelineData: []
        };
    }
};
