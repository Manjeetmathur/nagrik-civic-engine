import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { alertEvents } from '@/lib/server/eventEmitter';
import { Alert, IssueType, AlertStatus } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, location, description, imageUrl, reporter } = body;

        // Create new alert
        const newAlert: Alert = {
            id: `cl${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            type: type as IssueType,
            confidence: 0.85, // Default confidence for citizen reports
            location,
            timestamp: new Date().toISOString(),
            status: AlertStatus.PENDING,
            thumbnailUrl: imageUrl,
            fullImageUrl: imageUrl,
            description,
            detections: [],
            source: 'citizen',
            reporter
        };

        const createdAlert = await db.createAlert(newAlert);

        // Broadcast to SSE listeners
        alertEvents.emit('new-alert', createdAlert);

        return NextResponse.json(createdAlert);
    } catch (error) {
        console.error('Report submission error:', error);
        return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }
}
