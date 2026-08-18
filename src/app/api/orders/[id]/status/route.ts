import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders, auditLogs } from "@/db/schema";
import { sseBroadcaster } from "@/lib/realtime/sse-broadcaster";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = await params;
    const session = await auth();

    // Check staff or admin role
    const userRole = session?.user?.role;
    if (userRole !== "staff" && userRole !== "admin") {
      const isDev = process.env.NODE_ENV !== "production";
      if (!isDev) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Only culinary staff and administrators can change order status.",
            },
          },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const validated = updateStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid order status value.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { status: newStatus } = validated.data;

    // 1. Fetch current order
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
            message: "Order not found.",
          },
        },
        { status: 404 }
      );
    }

    const previousStatus = order.status;

    // 2. Update Order Status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    // 3. Log Audit Trail
    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || null,
      action: "ORDER_STATUS_CHANGED",
      entityType: "ORDER",
      entityId: orderId,
      metadata: {
        previousStatus,
        newStatus,
        orderNumber: order.orderNumber,
      },
    });

    // 4. Broadcast Realtime SSE Event
    const statusEvent = {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt,
    };

    sseBroadcaster.broadcastOrderStatus(orderId, statusEvent);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update order status.",
        },
      },
      { status: 500 }
    );
  }
}
