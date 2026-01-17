import { alertEvents } from '@/lib/server/eventEmitter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const encoder = new TextEncoder();

    let cleanup: () => void;

    const stream = new ReadableStream({
        start(controller) {
            const onNewAlert = (alert: any) => {
                try {
                    const data = `data: ${JSON.stringify(alert)}\n\n`;
                    controller.enqueue(encoder.encode(data));
                } catch (e) {
                    console.error('Error sending alert:', e);
                }
            };

            alertEvents.on('new-alert', onNewAlert);

            // Keep connection alive with heartbeat
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(': heartbeat\n\n'));
                } catch (e) {
                    // Ignore errors if controller is closed
                    if (cleanup) cleanup();
                }
            }, 30000);

            cleanup = () => {
                alertEvents.off('new-alert', onNewAlert);
                clearInterval(heartbeat);
            };
        },
        cancel() {
            if (cleanup) cleanup();
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
