import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders, auditLogs } from "@/db/schema";
import { sseBroadcaster } from "@/lib/realtime/sse-broadcaster";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = await params;
    const session = await auth();

    const userRole = session?.user?.role;
    if (userRole !== "staff" && userRole !== "admin") {
      const isDev = process.env.NODE_ENV !== "production";
      if (!isDev) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Akses ditolak.",
            },
          },
          { status: 403 }
        );
      }
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Pesanan tidak ditemukan.",
          },
        },
        { status: 404 }
      );
    }

    // Transition to preparing
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "preparing",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    // Audit Log
    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || null,
      action: "KITCHEN_ACKNOWLEDGED",
      entityType: "ORDER",
      entityId: orderId,
      metadata: {
        orderNumber: order.orderNumber,
      },
    });

    // Broadcast SSE
    sseBroadcaster.broadcastOrderStatus(orderId, {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt,
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error acknowledging order:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal mengonfirmasi pesanan dapur.",
        },
      },
      { status: 500 }
    );
  }
}
