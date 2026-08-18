import type { Metadata } from "next";
import { db } from "@/db";
import { orders, orderItems, orderItemOptions } from "@/db/schema";
import { desc, inArray } from "drizzle-orm";
import KitchenBoardClient, { KitchenTicket } from "@/components/kitchen/KitchenBoardClient";

export const metadata: Metadata = {
  title: "Kitchen Display System (KDS) | Nusantara Artisan Kitchen",
  description: "Papan antrean pesanan dapur realtime untuk staf dan chef.",
};

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  let initialOrders: KitchenTicket[] = [];

  try {
    const dbOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(30);

    const orderIds = dbOrders.map((o) => o.id);

    let allItems: Array<typeof orderItems.$inferSelect> = [];
    let allOptions: Array<typeof orderItemOptions.$inferSelect> = [];

    if (orderIds.length > 0) {
      allItems = await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds));

      const itemIds = allItems.map((i) => i.id);
      if (itemIds.length > 0) {
        allOptions = await db
          .select()
          .from(orderItemOptions)
          .where(inArray(orderItemOptions.orderItemId, itemIds));
      }
    }

    initialOrders = dbOrders.map((ord) => {
      const items = allItems
        .filter((i) => i.orderId === ord.id)
        .map((item) => {
          const itemOpts = allOptions.filter((o) => o.orderItemId === item.id);
          return {
            id: item.id,
            productName: item.productNameSnapshot,
            quantity: item.quantity,
            note: item.note,
            options: itemOpts.map((o) => ({
              name: o.optionNameSnapshot,
              priceDeltaMinor: o.priceDeltaMinor,
            })),
          };
        });

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        status: ord.status as KitchenTicket["status"],
        subtotalMinor: ord.subtotalMinor,
        taxMinor: ord.taxMinor,
        totalMinor: ord.totalMinor,
        currency: ord.currency,
        customerNote: ord.customerNote,
        createdAt: ord.createdAt ? ord.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: ord.updatedAt ? ord.updatedAt.toISOString() : new Date().toISOString(),
        items,
      };
    });
  } catch (err) {
    console.warn("DB query in KitchenPage SSR, using empty fallback list:", err);
  }

  return <KitchenBoardClient initialOrders={initialOrders} />;
}
