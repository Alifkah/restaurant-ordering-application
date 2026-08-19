import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { orders, payments, auditLogs } from "@/db/schema";
import { sseBroadcaster } from "@/lib/realtime/sse-broadcaster";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // 1. Cryptographic Signature Verification
  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown signature error";
      console.error(`⚠️ Webhook signature verification failed: ${msg}`);
      return NextResponse.json(
        { error: { code: "INVALID_SIGNATURE", message: `Webhook error: ${msg}` } },
        { status: 400 }
      );
    }
  } else {
    // If webhook secret is not set, try parsing body for development
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      return NextResponse.json(
        { error: { code: "INVALID_PAYLOAD", message: "Invalid JSON payload" } },
        { status: 400 }
      );
    }
  }

  // 2. Event Handling
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const sessionId = session.id;
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        if (orderId) {
          // Idempotency: Check if payment already processed
          const [existingPayment] = await db
            .select()
            .from(payments)
            .where(eq(payments.orderId, orderId))
            .limit(1);

          if (existingPayment?.status === "paid") {
            console.log(`Webhook: Payment for order ${orderId} already marked as paid.`);
            break;
          }

          // Update Payment status to paid
          if (existingPayment) {
            await db
              .update(payments)
              .set({
                status: "paid",
                providerPaymentId: paymentIntentId || null,
                checkoutSessionId: sessionId,
                paidAt: new Date(),
              })
              .where(eq(payments.id, existingPayment.id));
          } else {
            const [order] = await db
              .select()
              .from(orders)
              .where(eq(orders.id, orderId))
              .limit(1);

            if (order) {
              await db.insert(payments).values({
                orderId: order.id,
                provider: "stripe",
                providerPaymentId: paymentIntentId || null,
                checkoutSessionId: sessionId,
                status: "paid",
                amountMinor: order.totalMinor,
                currency: order.currency,
                paidAt: new Date(),
              });
            }
          }

          // Transition Order status from 'pending' to 'confirmed'
          const updateData: Partial<typeof orders.$inferInsert> = {
            status: "confirmed",
          };
          if (session.metadata?.tableNumber) {
            updateData.tableNumber = session.metadata.tableNumber;
          }
          if (session.metadata?.tableId) {
            updateData.tableId = session.metadata.tableId;
          }
          if (session.metadata?.orderType) {
            updateData.orderType = session.metadata.orderType as "dine_in" | "takeaway";
          }

          await db
            .update(orders)
            .set(updateData)
            .where(eq(orders.id, orderId));

          // Log Audit Trail
          await db.insert(auditLogs).values({
            action: "PAYMENT_CONFIRMED",
            entityType: "ORDER",
            entityId: orderId,
            metadata: {
              provider: "stripe",
              checkoutSessionId: sessionId,
              paymentIntentId,
              amountTotal: session.amount_total,
              currency: session.currency,
              orderType: session.metadata?.orderType,
              tableNumber: session.metadata?.tableNumber,
            },
          });

          // Broadcast SSE event
          sseBroadcaster.broadcastOrderStatus(orderId, {
            orderId,
            orderNumber: session.metadata?.orderNumber || orderId,
            status: "confirmed",
            updatedAt: new Date(),
          });

          console.log(`✅ Order ${orderId} successfully confirmed via Stripe webhook.`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await db
            .update(payments)
            .set({
              status: "failed",
              providerPaymentId: paymentIntent.id,
            })
            .where(eq(payments.orderId, orderId));

          await db.insert(auditLogs).values({
            action: "PAYMENT_FAILED",
            entityType: "ORDER",
            entityId: orderId,
            metadata: {
              error: paymentIntent.last_payment_error?.message,
            },
          });
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook event:", error);
    return NextResponse.json(
      {
        error: {
          code: "WEBHOOK_HANDLER_ERROR",
          message: "Internal error processing webhook.",
        },
      },
      { status: 500 }
    );
  }
}
