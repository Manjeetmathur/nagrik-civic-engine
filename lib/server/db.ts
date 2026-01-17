import { Alert, AlertStatus, Camera } from '@/types';
import { prisma } from '@/lib/prisma';

// Helper to convert Prisma Alert to Interface Alert
const mapAlert = (a: any): Alert => ({
    ...a,
    timestamp: a.timestamp.toISOString(),
    detections: a.detections ? JSON.parse(JSON.stringify(a.detections)) : undefined,
    reporter: a.reporter ? JSON.parse(JSON.stringify(a.reporter)) : undefined,
    feedback: a.feedback ? JSON.parse(JSON.stringify(a.feedback)) : undefined,
    type: a.type as any,
    status: a.status as AlertStatus,
    source: a.source as 'camera' | 'citizen'
});

// Helper to convert Prisma Camera to Interface Camera
const mapCamera = (c: any): Camera => ({
    ...c,
    lastPing: c.lastPing.toISOString(),
    status: c.status as 'online' | 'offline',
    sourceType: c.sourceType as 'webcam' | 'remote'
});

export const db = {
    // Alert operations
    async getAllAlerts(): Promise<Alert[]> {
        const alerts = await prisma.alert.findMany({
            orderBy: { timestamp: 'desc' }
        });
        return alerts.map(mapAlert);
    },

    async getAlertById(id: string): Promise<Alert | null> {
        const alert = await prisma.alert.findUnique({
            where: { id }
        });
        return alert ? mapAlert(alert) : null;
    },

    async createAlert(alert: Alert): Promise<Alert> {
        // Remove id if it's auto-generated or allow passing it?
        // Usually creation shouldn't enforce ID, but if provided we use it.
        // Also handle dates.
        const { id, timestamp, detections, reporter, feedback, ...rest } = alert;

        const created = await prisma.alert.create({
            data: {
                ...rest,
                // if id is provided let's use it, else generic
                // But prisma default is cuid(), so we can omit if undefined
                type: rest.type.toString(),
                status: rest.status.toString(),
                detections: detections as any ?? undefined,
                reporter: reporter as any ?? undefined,
                feedback: feedback as any ?? undefined,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            }
        });
        return mapAlert(created);
    },

    async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
        try {
            const { timestamp, detections, reporter, feedback, ...rest } = updates;
            const updated = await prisma.alert.update({
                where: { id },
                data: {
                    ...rest,
                    timestamp: timestamp ? new Date(timestamp) : undefined,
                    detections: detections as any ?? undefined,
                    reporter: reporter as any ?? undefined,
                    feedback: feedback as any ?? undefined,
                }
            });
            return mapAlert(updated);
        } catch (e) {
            return null;
        }
    },

    async addFeedback(id: string, rating: number, comment: string): Promise<Alert | null> {
        try {
            const updated = await prisma.alert.update({
                where: { id },
                data: {
                    feedback: {
                        rating,
                        comment,
                        submittedAt: new Date().toISOString()
                    }
                }
            });
            return mapAlert(updated);
        } catch (e) {
            return null;
        }
    },

    // Camera operations
    async getAllCameras(): Promise<Camera[]> {
        const cameras = await prisma.camera.findMany({
            orderBy: { name: 'asc' }
        });
        return cameras.map(mapCamera);
    },

    async getCameraById(id: string): Promise<Camera | null> {
        const camera = await prisma.camera.findUnique({ where: { id } });
        return camera ? mapCamera(camera) : null;
    },

    async updateCameraStatus(id: string, status: 'online' | 'offline'): Promise<Camera | null> {
        return this.updateCamera(id, { status, lastPing: new Date().toISOString() });
    },

    async createCamera(camera: Camera): Promise<Camera> {
        const { id, lastPing, ...rest } = camera;
        const created = await prisma.camera.create({
            data: {
                ...rest,
                lastPing: lastPing ? new Date(lastPing) : new Date(),
                sourceType: rest.sourceType || 'webcam'
            }
        });
        return mapCamera(created);
    },

    async updateCamera(id: string, updates: Partial<Camera>): Promise<Camera | null> {
        try {
            const { lastPing, ...rest } = updates;
            const updated = await prisma.camera.update({
                where: { id },
                data: {
                    ...rest,
                    lastPing: lastPing ? new Date(lastPing) : undefined,
                }
            });
            return mapCamera(updated);
        } catch (e) {
            return null;
        }
    },

    // Analytics
    async getAnalyticsSummary() {
        const totalIncidents = await prisma.alert.count();
        const activeAlerts = await prisma.alert.count({
            where: { status: AlertStatus.PENDING }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const resolvedToday = await prisma.alert.count({
            where: {
                status: AlertStatus.RESOLVED,
                timestamp: { gte: today }
            }
        });

        const onlineCameras = await prisma.camera.count({
            where: { status: 'online' }
        });
        const totalCameras = await prisma.camera.count();

        return {
            stats: {
                activeAlerts,
                resolvedToday,
                totalIncidents,
                onlineCameras,
                totalCameras
            },
            distribution: [], // Implement specific aggregation if needed
            statusHealth: [],
            timelineData: []
        };
    }
};
