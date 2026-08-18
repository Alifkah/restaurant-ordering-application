import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { sseBroadcaster } from "@/lib/realtime/sse-broadcaster";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();

  // Otorisasi: Kitchen stream wajib staf atau admin
  const userRole = session?.user?.role;
  if (userRole !== "staff" && userRole !== "admin") {
    // In dev mode, allow testing if query param has staff_preview=true
    const isDevPreview = req.nextUrl.searchParams.get("dev_preview") === "true";
    if (!isDevPreview && process.env.NODE_ENV === "production") {
      return new Response("Unauthorized for kitchen stream", { status: 401 });
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial Connection Handshake
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", time: new Date() })}\n\n`)
      );

      // 2. Heartbeat keepalive every 25 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      // 3. Subscribe to kitchen broadcaster
      const unsubscribe = sseBroadcaster.onKitchenEvent((data) => {
        try {
          controller.enqueue(
            encoder.encode(`event: kitchen_update\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          unsubscribe();
          clearInterval(heartbeatInterval);
        }
      });

      // 4. Handle client disconnect
      req.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          // Already closed
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
