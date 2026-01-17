import { NextResponse } from 'next/server';
import { sendAccidentAlert } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { alert } = body;

        if (!alert) {
            return NextResponse.json(
                { error: 'Alert data is required' },
                { status: 400 }
            );
        }

        // Only send email for accident-type alerts from cameras
        if (alert.type?.toLowerCase().includes('accident') && alert.source === 'camera') {
            const result = await sendAccidentAlert({
                id: alert.id,
                type: alert.type,
                location: alert.location,
                timestamp: new Date(alert.timestamp),
                confidence: alert.confidence,
                cameraId: alert.cameraId,
                latitude: alert.reporter?.coordinates?.lat,
                longitude: alert.reporter?.coordinates?.lng,
                imageUrl: alert.thumbnailUrl,
            });

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    message: 'Accident alert email sent successfully',
                    messageId: result.messageId,
                });
            } else {
                return NextResponse.json(
                    { error: 'Failed to send email', details: result.error },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: false,
            message: 'Alert does not meet criteria for email notification',
        });
    } catch (error) {
        console.error('Error in notify API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
