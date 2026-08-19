import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, orderItemOptions, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Order ID is required." } },
        { status: 400 }
      );
    }

    // 1. Fetch Order with items & options
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found." } },
        { status: 404 }
      );
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const itemOptions = await db
      .select()
      .from(orderItemOptions);

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    const formattedItems = items.map((item) => {
      const options = itemOptions.filter((opt) => opt.orderItemId === item.id);
      return {
        id: item.id,
        name: item.productNameSnapshot,
        quantity: item.quantity,
        note: item.note,
        options: options.map((o) => ({
          name: o.optionNameSnapshot,
          priceDeltaMinor: Number(o.priceDeltaMinor),
        })),
        lineTotalMinor: Number(item.lineTotalMinor),
      };
    });

    const isPaid = payment?.status === "paid";
    const paymentLabel = isPaid ? "[PAID]" : "[UNPAID - BAYAR DI KASIR]";

    // 2. Generate ASCII Formatted Monospace Text for 80mm / 58mm POS Printers
    const separator = "------------------------------------------\n";
    const doubleSep = "==========================================\n";

    let textTicket = "";
    textTicket += "            NUSANTARA ARTISAN             \n";
    textTicket += "            KITCHEN & LOUNGE              \n";
    textTicket += "   Jl. Artisan No. 8 • (021) 555-8989    \n";
    textTicket += doubleSep;

    if (order.orderType === "dine_in") {
      textTicket += `       *** TABLE ${order.tableNumber || "00"} - DINE IN ***       \n`;
    } else {
      textTicket += "          *** TAKEAWAY ORDER ***          \n";
    }

    textTicket += doubleSep;
    textTicket += `Order No : ${order.orderNumber}\n`;
    textTicket += `Time     : ${new Date(order.createdAt).toLocaleString("id-ID")}\n`;
    textTicket += `Payment  : ${paymentLabel}\n`;
    textTicket += separator;
    textTicket += "ITEM / MODIFIER                        QTY\n";
    textTicket += separator;

    for (let i = 0; i < formattedItems.length; i++) {
      const item = formattedItems[i];
      textTicket += `${(i + 1).toString().padEnd(2)}. ${item.name.padEnd(30)} x${item.quantity}\n`;
      if (item.options.length > 0) {
        for (const opt of item.options) {
          textTicket += `    + ${opt.name}\n`;
        }
      }
      if (item.note) {
        textTicket += `    >> Note: "${item.note}"\n`;
      }
    }

    textTicket += separator;
    if (order.customerNote) {
      textTicket += `SPECIAL NOTE:\n${order.customerNote}\n`;
      textTicket += separator;
    }

    textTicket += `Subtotal : Rp ${Number(order.subtotalMinor).toLocaleString("id-ID")}\n`;
    textTicket += `Tax (PB1): Rp ${Number(order.taxMinor).toLocaleString("id-ID")}\n`;
    textTicket += `TOTAL    : Rp ${Number(order.totalMinor).toLocaleString("id-ID")}\n`;
    textTicket += doubleSep;
    textTicket += "             --- KITCHEN COPY ---         \n\n\n\n";

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        tableNumber: order.tableNumber,
        status: order.status,
        paymentStatus: payment?.status || "pending",
        paymentProvider: payment?.provider || "cashier_cash",
        createdAt: order.createdAt,
        subtotalMinor: Number(order.subtotalMinor),
        taxMinor: Number(order.taxMinor),
        totalMinor: Number(order.totalMinor),
        customerNote: order.customerNote,
        items: formattedItems,
        plainText: textTicket,
      },
    });
  } catch (error) {
    console.error("Error generating print KOT:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to generate KOT print ticket." } },
      { status: 500 }
    );
  }
}
