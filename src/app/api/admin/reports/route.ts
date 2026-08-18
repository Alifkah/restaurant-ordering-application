import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    const totalOrders = allOrders.length;
    const validOrders = allOrders.filter((o) => o.status !== "cancelled");
    const totalRevenueMinor = validOrders.reduce((sum, o) => sum + o.totalMinor, 0);
    const completedOrders = allOrders.filter((o) => o.status === "completed").length;
    const averageTicketMinor =
      validOrders.length > 0 ? Math.round(totalRevenueMinor / validOrders.length) : 0;

    // Top selling products count from order items
    const allItems = await db.select().from(orderItems).limit(200);
    const productCounts = new Map<string, { name: string; quantity: number }>();

    for (const item of allItems) {
      const existing = productCounts.get(item.productId) || {
        name: item.productNameSnapshot,
        quantity: 0,
      };
      existing.quantity += item.quantity;
      productCounts.set(item.productId, existing);
    }

    const topSelling = Array.from(productCounts.entries())
      .map(([id, data]) => ({ id, name: data.name, quantity: data.quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenueMinor,
        totalOrders,
        completedOrders,
        averageTicketMinor,
        recentOrders: allOrders.slice(0, 8),
        topSelling,
      },
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to generate analytics reports." } },
      { status: 500 }
    );
  }
}
