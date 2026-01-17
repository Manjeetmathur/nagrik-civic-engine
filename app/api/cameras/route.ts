import { NextResponse } from 'next/server';
import { db } from '../../../lib/server/db';

export async function GET() {
    try {
        const cameras = await db.getAllCameras();
        return NextResponse.json(cameras);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch cameras' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const newCamera = await db.createCamera({
            ...data,
            id: `CAM-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            status: data.status || 'online',
            sourceType: data.sourceType || (data.streamUrl ? 'remote' : 'webcam'),
            lastPing: new Date().toISOString()
        });
        return NextResponse.json(newCamera);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create camera' }, { status: 500 });
    }
}
