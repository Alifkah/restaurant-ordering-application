import { NextRequest } from "next/server";
import { sseBroadcaster } from "@/lib/realtime/sse-broadcaster";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id: orderId } = await params;

  if (!orderId) {
    return new Response("Order ID required", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Handshake
      controller.enqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify({ orderId, status: "connected", time: new Date() })}\n\n`
        )
      );

      // 2. Heartbeat Ping
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      // 3. Subscribe to specific order updates
      const unsubscribe = sseBroadcaster.onOrderEvent(orderId, (data) => {
        try {
          controller.enqueue(
            encoder.encode(`event: status_change\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          unsubscribe();
          clearInterval(heartbeatInterval);
        }
      });

      // 4. Handle Disconnect
      req.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          // Closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
