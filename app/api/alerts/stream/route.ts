import { alertEvents } from '@/lib/server/eventEmitter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const onNewAlert = (alert: any) => {
                const data = `data: ${JSON.stringify(alert)}\n\n`;
                controller.enqueue(encoder.encode(data));
            };

            alertEvents.on('new-alert', onNewAlert);

            // Cleanup on close
            const cleanup = () => {
                alertEvents.off('new-alert', onNewAlert);
            };

            // Keep connection alive with heartbeat
            const heartbeat = setInterval(() => {
                controller.enqueue(encoder.encode(': heartbeat\n\n'));
            }, 30000);

            return () => {
                cleanup();
                clearInterval(heartbeat);
            };
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
