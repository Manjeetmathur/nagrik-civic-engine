import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { AlertStatus } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const alert = await db.getAlertById(id);

        if (!alert) {
            return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        return NextResponse.json(alert);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch alert' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!Object.values(AlertStatus).includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedAlert = await db.updateAlert(id, { status });

        if (!updatedAlert) {
            return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        return NextResponse.json(updatedAlert);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
    }
}
