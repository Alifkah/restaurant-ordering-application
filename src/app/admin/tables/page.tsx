import type { Metadata } from "next";
import TablesClient, { AdminTable } from "@/components/admin/TablesClient";
import { db } from "@/db";
import { restaurantTables, orders } from "@/db/schema";
import { asc, inArray } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Tables & QR Ordering Suite | Nusantara Admin Suite",
  description: "Manage dining zones, seating capacities, and generate ready-to-print QR table standees.",
};

export const dynamic = "force-dynamic";

export default async function AdminTablesPage() {
  let initialTables: AdminTable[] = [];

  try {
    const list = await db
      .select()
      .from(restaurantTables)
      .orderBy(asc(restaurantTables.tableNumber));

    const activeOrders = await db
      .select({
        tableId: orders.tableId,
        status: orders.status,
      })
      .from(orders)
      .where(inArray(orders.status, ["pending", "confirmed", "preparing", "ready"]));

    const activeOrderMap: Record<string, number> = {};
    for (const ord of activeOrders) {
      if (ord.tableId) {
        activeOrderMap[ord.tableId] = (activeOrderMap[ord.tableId] || 0) + 1;
      }
    }

    initialTables = list.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      activeOrderCount: activeOrderMap[t.id] || 0,
    }));
  } catch (err) {
    console.warn("Could not fetch tables during SSR:", err);
  }

  return <TablesClient initialTables={initialTables} />;
}
