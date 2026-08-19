import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, orderItemOptions, users, auditLogs, payments } from "@/db/schema";
import { createOrderSchema } from "@/lib/validation/order";
import {
  calculateOrderPrices,
  OrderCalculationError,
} from "@/domain/order-calculator";
import { sseBroadcaster } from "@/lib/realtime/sse-broadcaster";
import { eq, desc } from "drizzle-orm";

/**
 * Generate human-friendly order number e.g. ORD-20260818-7F3A
 */
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
  return `ORD-${dateStr}-${randomSuffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    // 1. Validate Input Payload
    const validated = createOrderSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid order payload.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { items, diningOption, tableNumber, tableId, customerNote, discountMinor, guestName, guestEmail, guestPhone, paymentMethod = "stripe" } =
      validated.data;

    // 2. Resolve Customer User ID (Session or Guest)
    let customerId = session?.user?.id;

    if (!customerId) {
      if (guestEmail) {
        const normalizedEmail = guestEmail.trim().toLowerCase();
        const [existingGuestUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (existingGuestUser) {
          customerId = existingGuestUser.id;
        } else {
          const [newGuestUser] = await db
            .insert(users)
            .values({
              email: normalizedEmail,
              name: guestName?.trim() || "Guest Customer",
              role: "customer",
              status: "active",
            })
            .returning({ id: users.id });
          customerId = newGuestUser.id;
        }
      } else {
        // Fallback to default customer account for anonymous guest orders
        const [defaultCustomer] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.role, "customer"))
          .limit(1);

        if (defaultCustomer) {
          customerId = defaultCustomer.id;
        } else {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "UNAUTHORIZED",
                message: "Please sign in or provide contact details to complete your order.",
              },
            },
            { status: 401 }
          );
        }
      }
    }

    // 3. Server-Authoritative Price Calculation
    const calculation = await calculateOrderPrices(items, discountMinor);

    // 4. Construct Final Customer Note with Dining Option & Guest Details
    let finalNote = customerNote?.trim() || "";
    const paymentLabel = paymentMethod === "cash" ? "Cash/Tunai" : paymentMethod === "qris" ? "QRIS" : "Stripe Online";
    const guestMeta = [
      guestName ? `Name: ${guestName.trim()}` : null,
      guestPhone ? `WA: ${guestPhone.trim()}` : null,
      `Pay: ${paymentLabel}`,
    ].filter(Boolean).join(" • ");

    if (diningOption === "dine_in") {
      const tableInfo = tableNumber ? `Table ${tableNumber.trim()}` : "Dine-In";
      finalNote = `[Dine-In - ${tableInfo} | ${guestMeta}] ${finalNote}`.trim();
    } else {
      finalNote = `[Takeaway | ${guestMeta}] ${finalNote}`.trim();
    }

    // 5. Generate Unique Order Number
    const orderNumber = generateOrderNumber();

    // 6. Insert Order Record
    const [createdOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerId,
        orderType: diningOption,
        tableNumber: diningOption === "dine_in" && tableNumber ? tableNumber.trim() : null,
        tableId: diningOption === "dine_in" && tableId ? tableId : null,
        status: "pending",
        subtotalMinor: calculation.subtotalMinor,
        discountMinor: calculation.discountMinor,
        taxMinor: calculation.taxMinor,
        totalMinor: calculation.totalMinor,
        currency: calculation.currency,
        customerNote: finalNote || null,
      })
      .returning();

    // 7. Insert Order Items & Item Options Snapshots
    for (const calcItem of calculation.items) {
      const [insertedOrderItem] = await db
        .insert(orderItems)
        .values({
          orderId: createdOrder.id,
          productId: calcItem.productId,
          productNameSnapshot: calcItem.productNameSnapshot,
          unitPriceMinor: calcItem.unitPriceMinor,
          quantity: calcItem.quantity,
          lineTotalMinor: calcItem.lineTotalMinor,
          note: calcItem.note,
        })
        .returning();

      if (calcItem.options.length > 0) {
        for (const opt of calcItem.options) {
          await db.insert(orderItemOptions).values({
            orderItemId: insertedOrderItem.id,
            productOptionId: opt.productOptionId,
            optionNameSnapshot: opt.optionNameSnapshot,
            priceDeltaMinor: opt.priceDeltaMinor,
            quantity: opt.quantity,
          });
        }
      }
    }

    // 8. Insert Payment Record for Non-Stripe (Cash / QRIS)
    if (paymentMethod === "cash" || paymentMethod === "qris") {
      await db.insert(payments).values({
        orderId: createdOrder.id,
        provider: paymentMethod,
        status: "pending",
        amountMinor: createdOrder.totalMinor,
        currency: createdOrder.currency,
      });
    }

    // 8. Log Audit Trail
    await db.insert(auditLogs).values({
      actorUserId: customerId,
      action: "ORDER_CREATED",
      entityType: "ORDER",
      entityId: createdOrder.id,
      metadata: {
        orderNumber: createdOrder.orderNumber,
        totalMinor: createdOrder.totalMinor,
        itemsCount: calculation.items.length,
        diningOption,
        tableNumber,
      },
    });

    // 9. Broadcast Realtime SSE Event to Kitchen & Tracker
    sseBroadcaster.broadcastKitchenOrder({
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      status: createdOrder.status,
      totalMinor: createdOrder.totalMinor,
      currency: createdOrder.currency,
      customerNote: createdOrder.customerNote,
      createdAt: createdOrder.createdAt,
      itemsCount: calculation.items.length,
      items: calculation.items.map((i) => ({
        id: i.productId,
        productName: i.productNameSnapshot,
        quantity: i.quantity,
        note: i.note,
        options: i.options.map((o) => ({ name: o.optionNameSnapshot })),
      })),
    });

    sseBroadcaster.broadcastOrderStatus(createdOrder.id, {
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      status: createdOrder.status,
      updatedAt: createdOrder.createdAt,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          status: createdOrder.status,
          subtotalMinor: createdOrder.subtotalMinor,
          taxMinor: createdOrder.taxMinor,
          totalMinor: createdOrder.totalMinor,
          currency: createdOrder.currency,
          customerNote: createdOrder.customerNote,
          createdAt: createdOrder.createdAt,
          items: calculation.items,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof OrderCalculationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 422 }
      );
    }

    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order on server. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
          },
        },
        { status: 401 }
      );
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    let userOrders = [];

    if (userRole === "admin" || userRole === "staff") {
      userOrders = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(50);
    } else {
      userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.customerId, userId))
        .orderBy(desc(orders.createdAt));
    }

    return NextResponse.json({
      success: true,
      data: userOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve order history.",
        },
      },
      { status: 500 }
    );
  }
}
