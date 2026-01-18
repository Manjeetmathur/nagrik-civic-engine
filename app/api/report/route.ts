import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { alertEvents } from '@/lib/server/eventEmitter';
import { Alert, IssueType, AlertStatus } from '@/types';
import { enhanceReportDescription } from '@/utils/enhanceDescription';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, location, description, imageUrl, reporter } = body;

        const enhancedDescription = await enhanceReportDescription(
            description,
            type,
            location
        );

        const newAlert: Alert = {
            id: `cl${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            type: type as IssueType,
            confidence: 0.85,
            location,
            timestamp: new Date().toISOString(),
            status: AlertStatus.PENDING,
            thumbnailUrl: imageUrl,
            fullImageUrl: imageUrl,
            description: enhancedDescription,
            detections: [],
            source: 'citizen',
            reporter
        };

        const createdAlert = await db.createAlert(newAlert);
        alertEvents.emit('new-alert', createdAlert);
        return NextResponse.json({
            ...createdAlert,
            originalDescription: description,
        });
    } catch (error) {
        console.error('Report submission error:', error);
        return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }
}
