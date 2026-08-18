import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, orderItemOptions, payments, products } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    // 1. Fetch Order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
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

    // 2. Role & Ownership Check
    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    if (userRole !== "admin" && userRole !== "staff") {
      if (userId && order.customerId !== userId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "You do not have permission to view this order.",
            },
          },
          { status: 403 }
        );
      }
    }

    // 3. Fetch Items and Options
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

    // Fetch product images for items
    const productIds = items.map((i) => i.productId);
    const productImages = await db
      .select({ id: products.id, imageUrl: products.imageUrl })
      .from(products)
      .where(inArray(products.id, productIds));
    const imageMap = new Map(productImages.map((p) => [p.id, p.imageUrl]));

    // 4. Fetch Payment
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .limit(1);

    // Assemble payload
    const detailedItems = items.map((item) => {
      const itemOpts = options.filter((o) => o.orderItemId === item.id);
      return {
        id: item.id,
        productId: item.productId,
        productName: item.productNameSnapshot,
        unitPriceMinor: item.unitPriceMinor,
        quantity: item.quantity,
        lineTotalMinor: item.lineTotalMinor,
        note: item.note,
        imageUrl: imageMap.get(item.productId) || null,
        options: itemOpts.map((o) => ({
          id: o.id,
          productOptionId: o.productOptionId,
          name: o.optionNameSnapshot,
          priceDeltaMinor: o.priceDeltaMinor,
          quantity: o.quantity,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        status: order.status,
        subtotalMinor: order.subtotalMinor,
        taxMinor: order.taxMinor,
        discountMinor: order.discountMinor,
        totalMinor: order.totalMinor,
        currency: order.currency,
        customerNote: order.customerNote,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        payment: payment || null,
        items: detailedItems,
      },
    });
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve order details.",
        },
      },
      { status: 500 }
    );
  }
}
