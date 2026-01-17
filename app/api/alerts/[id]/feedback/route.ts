import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { rating, comment } = body;

        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid rating (must be 1-5)' }, { status: 400 });
        }

        const updatedAlert = await db.addFeedback(id, rating, comment || '');

        if (!updatedAlert) {
            return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        return NextResponse.json(updatedAlert);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }
}
