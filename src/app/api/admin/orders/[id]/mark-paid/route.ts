import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders, payments, auditLogs } from "@/db/schema";
import { sseBroadcaster } from "@/lib/realtime/sse-broadcaster";
import { eq } from "drizzle-orm";
import { z } from "zod";

const markPaidSchema = z.object({
  paymentMethod: z
    .enum(["cashier_cash", "cashier_edc", "cash", "qris", "stripe"])
    .default("cashier_cash"),
  notes: z.string().optional().nullable(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;

    if (
      process.env.NODE_ENV === "production" &&
      userRole !== "admin" &&
      userRole !== "staff"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Staff or Admin authorization required to confirm cashier payments.",
          },
        },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Order ID is required." },
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validated = markPaidSchema.safeParse(body);
    const paymentMethod = validated.success
      ? validated.data.paymentMethod
      : "cashier_cash";

    // 1. Fetch existing order
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Order not found." },
        },
        { status: 404 }
      );
    }

    // 2. Update or insert payment record
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    const now = new Date();

    if (existingPayment) {
      await db
        .update(payments)
        .set({
          provider: paymentMethod,
          status: "paid",
          paidAt: now,
          updatedAt: now,
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await db.insert(payments).values({
        orderId,
        provider: paymentMethod,
        status: "paid",
        amountMinor: existingOrder.totalMinor,
        currency: existingOrder.currency,
        paidAt: now,
      });
    }

    // 3. Advance order status to 'confirmed' if it was 'pending'
    let newStatus = existingOrder.status;
    if (existingOrder.status === "pending") {
      newStatus = "confirmed";
      await db
        .update(orders)
        .set({
          status: "confirmed",
          updatedAt: now,
        })
        .where(eq(orders.id, orderId));
    }

    // 4. Log Audit Trail
    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || existingOrder.customerId,
      action: "ORDER_MARKED_PAID",
      entityType: "ORDER",
      entityId: orderId,
      metadata: {
        orderNumber: existingOrder.orderNumber,
        paymentMethod,
        amountMinor: existingOrder.totalMinor,
      },
    });

    // 5. Broadcast Realtime SSE Event
    sseBroadcaster.broadcastOrderStatus(orderId, {
      orderId,
      orderNumber: existingOrder.orderNumber,
      status: newStatus,
      updatedAt: now,
    });

    sseBroadcaster.broadcastKitchenOrder({
      orderId,
      orderNumber: existingOrder.orderNumber,
      status: newStatus,
      totalMinor: existingOrder.totalMinor,
      currency: existingOrder.currency,
      customerNote: existingOrder.customerNote,
      createdAt: existingOrder.createdAt,
      itemsCount: 0,
      items: [],
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderNumber: existingOrder.orderNumber,
        status: newStatus,
        paymentStatus: "paid",
        paymentMethod,
        paidAt: now,
      },
      message: `Order #${existingOrder.orderNumber} marked as paid successfully!`,
    });
  } catch (error) {
    console.error("Error marking order as paid:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark order as paid.",
        },
      },
      { status: 500 }
    );
  }
}
