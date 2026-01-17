import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

export async function GET() {
    try {
        const alerts = await db.getAllAlerts();
        return NextResponse.json(alerts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }
}
