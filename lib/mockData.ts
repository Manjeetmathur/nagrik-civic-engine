import { Alert, Camera } from '@/types';

export const mockAlerts: Alert[] = [];

export const mockCameras: Camera[] = [
    {
        id: 'CAM-DEFAULT',
        name: 'Local Webcam',
        location: 'Default Office',
        status: 'online',
        lastPing: new Date().toISOString(),
        ip: '127.0.0.1',
        sourceType: 'webcam'
    }
];
