import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, orderItemOptions, payments, restaurantSettings } from "@/db/schema";
import { stripe, convertToStripeAmount } from "@/lib/stripe";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const createCheckoutSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createCheckoutSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Payload tidak valid.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { orderId } = validated.data;

    // 1. Query Order
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

    // 2. Fetch Order Items & Options
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    const itemIds = items.map((i) => i.id);
    let options: Array<typeof orderItemOptions.$inferSelect> = [];
    if (itemIds.length > 0) {
      options = await db
        .select()
        .from(orderItemOptions)
        .where(inArray(orderItemOptions.orderItemId, itemIds));
    }

    // 3. Fetch Currency Settings
    const [settings] = await db
      .select()
      .from(restaurantSettings)
      .limit(1);

    const currencyCode = (order.currency || settings?.currency || "IDR").toLowerCase();
    const currencyDecimals = settings?.currencyDecimals ?? 0;

    // Determine Base URL
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const hasValidStripeKey =
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes("placeholder") &&
      process.env.STRIPE_SECRET_KEY.startsWith("sk_");

    // 4. If Stripe Key is not configured (Local Dev Fallback)
    if (!hasValidStripeKey) {
      const mockSessionId = `cs_dev_${Date.now()}`;

      // Upsert payment record
      const [existingPayment] = await db
        .select()
        .from(payments)
        .where(eq(payments.orderId, order.id))
        .limit(1);

      if (existingPayment) {
        await db
          .update(payments)
          .set({
            checkoutSessionId: mockSessionId,
            status: "paid",
            paidAt: new Date(),
          })
          .where(eq(payments.id, existingPayment.id));
      } else {
        await db.insert(payments).values({
          orderId: order.id,
          provider: "stripe_mock",
          checkoutSessionId: mockSessionId,
          status: "paid",
          amountMinor: order.totalMinor,
          currency: order.currency,
          paidAt: new Date(),
        });
      }

      // Update order status to confirmed
      await db
        .update(orders)
        .set({ status: "confirmed" })
        .where(eq(orders.id, order.id));

      const successUrl = `${origin}/checkout/success?session_id=${mockSessionId}&order_id=${order.id}&is_dev_mode=true`;

      return NextResponse.json({
        success: true,
        data: {
          url: successUrl,
          sessionId: mockSessionId,
          isDevMode: true,
        },
      });
    }

    // 5. Create Live Stripe Checkout Session
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: {
          name: string;
          description?: string;
        };
        unit_amount: number;
      };
      quantity: number;
    }> = [];

    for (const item of items) {
      const itemOpts = options.filter((o) => o.orderItemId === item.id);
      const optDesc = itemOpts.map((o) => o.optionNameSnapshot).join(", ");
      const fullUnitPriceMinor = Math.round(item.lineTotalMinor / item.quantity);

      lineItems.push({
        price_data: {
          currency: currencyCode,
          product_data: {
            name: item.productNameSnapshot,
            description: optDesc || (item.note ? `Catatan: ${item.note}` : undefined),
          },
          unit_amount: convertToStripeAmount(
            fullUnitPriceMinor,
            currencyCode,
            currencyDecimals
          ),
        },
        quantity: item.quantity,
      });
    }

    // Add Tax as line item if applicable
    if (order.taxMinor > 0) {
      lineItems.push({
        price_data: {
          currency: currencyCode,
          product_data: {
            name: "Pajak Restoran (PB1 10%)",
            description: "Pajak barang dan jasa restoran",
          },
          unit_amount: convertToStripeAmount(
            order.taxMinor,
            currencyCode,
            currencyDecimals
          ),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${origin}/checkout/cancel?order_id=${order.id}`,
    });

    // 6. Record or Update Payment in Database
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .limit(1);

    if (existingPayment) {
      await db
        .update(payments)
        .set({
          checkoutSessionId: session.id,
          status: "pending",
          amountMinor: order.totalMinor,
          currency: order.currency,
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await db.insert(payments).values({
        orderId: order.id,
        provider: "stripe",
        checkoutSessionId: session.id,
        status: "pending",
        amountMinor: order.totalMinor,
        currency: order.currency,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "STRIPE_CHECKOUT_ERROR",
          message: "Gagal membuat sesi pembayaran Stripe.",
        },
      },
      { status: 500 }
    );
  }
}
