import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { restaurantTables, orders, auditLogs } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const createTableSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required").max(20),
  zone: z.string().min(1, "Zone is required").max(50).default("Indoor"),
  capacity: z.number().int().min(1).max(50).default(4),
  isActive: z.boolean().default(true),
  customToken: z.string().max(64).optional(),
});

function generateSecureQrToken(tableNumber: string): string {
  const cleanNum = tableNumber.toLowerCase().replace(/[^a-z0-9]/g, "");
  const randomHex = crypto.randomBytes(16).toString("hex");
  return `tbl_tok_${cleanNum}_${randomHex}`.slice(0, 64);
}

export async function GET() {
  try {
    const tablesList = await db
      .select()
      .from(restaurantTables)
      .orderBy(asc(restaurantTables.tableNumber));

    // Also get active orders count per table
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

    const data = tablesList.map((t) => ({
      ...t,
      activeOrderCount: activeOrderMap[t.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve restaurant tables.",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Only administrators can manage tables." },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createTableSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid table payload.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { tableNumber, zone, capacity, isActive, customToken } = validated.data;

    // Check if tableNumber already exists
    const [existing] = await db
      .select()
      .from(restaurantTables)
      .where(eq(restaurantTables.tableNumber, tableNumber.trim()))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_TABLE",
            message: `Table number "${tableNumber}" already exists.`,
          },
        },
        { status: 409 }
      );
    }

    const qrCodeToken = customToken?.trim() || generateSecureQrToken(tableNumber.trim());

    const [createdTable] = await db
      .insert(restaurantTables)
      .values({
        tableNumber: tableNumber.trim(),
        qrCodeToken,
        zone: zone.trim(),
        capacity,
        isActive,
      })
      .returning();

    // Log Audit Trail
    if (session?.user?.id) {
      await db.insert(auditLogs).values({
        actorUserId: session.user.id,
        action: "TABLE_CREATED",
        entityType: "TABLE",
        entityId: createdTable.id,
        metadata: {
          tableNumber: createdTable.tableNumber,
          zone: createdTable.zone,
          capacity: createdTable.capacity,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: createdTable,
        message: "Restaurant table registered successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create restaurant table.",
        },
      },
      { status: 500 }
    );
  }
}
