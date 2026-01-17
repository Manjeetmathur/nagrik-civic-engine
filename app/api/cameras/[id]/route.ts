import { NextResponse } from 'next/server';
import { db } from '../../../../lib/server/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();
        const updatedCamera = await db.updateCamera(id, data);

        if (!updatedCamera) {
            return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
        }

        return NextResponse.json(updatedCamera);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update camera' }, { status: 500 });
    }
}
