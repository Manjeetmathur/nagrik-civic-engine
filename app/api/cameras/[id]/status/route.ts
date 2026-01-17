import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (status !== 'online' && status !== 'offline') {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedCamera = await db.updateCameraStatus(id, status);

        if (!updatedCamera) {
            return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
        }

        return NextResponse.json(updatedCamera);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update camera' }, { status: 500 });
    }
}
