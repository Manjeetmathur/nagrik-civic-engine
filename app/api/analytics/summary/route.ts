import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

export async function GET() {
    try {
        const summary = await db.getAnalyticsSummary();
        return NextResponse.json(summary);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
