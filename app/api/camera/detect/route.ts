import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { alertEvents } from '@/lib/server/eventEmitter';
import { Alert, AlertStatus } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cameraId, imageData, type, confidence } = body;

        if (!cameraId || !imageData || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const camera = await db.getCameraById(cameraId);
        if (!camera) {
            return NextResponse.json(
                { error: 'Camera not found' },
                { status: 404 }
            );
        }

        const newAlert: Alert = {
            id: `tm${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            confidence: confidence || 1.0,
            location: camera.location,
            timestamp: new Date().toISOString(),
            status: AlertStatus.PENDING,
            thumbnailUrl: imageData,
            fullImageUrl: imageData,
            cameraId: camera.id,
            description: `Teachable Machine detected ${type.toLowerCase()} with ${Math.round((confidence || 1) * 100)}% confidence`,
            source: 'camera'
        };

        await db.createAlert(newAlert);
        alertEvents.emit('new-alert', newAlert);

        return NextResponse.json({
            success: true,
            alert: newAlert
        });
    } catch (error) {
        console.error('Error creating detection alert:', error);
        return NextResponse.json(
            { error: 'Failed to create alert' },
            { status: 500 }
        );
    }
}
