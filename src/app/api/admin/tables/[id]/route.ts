import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { restaurantTables, auditLogs } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateTableSchema = z.object({
  tableNumber: z.string().min(1).max(20).optional(),
  zone: z.string().min(1).max(50).optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
  regenerateToken: z.boolean().optional(),
});

function generateSecureQrToken(tableNumber: string): string {
  const cleanNum = tableNumber.toLowerCase().replace(/[^a-z0-9]/g, "");
  const randomHex = crypto.randomBytes(16).toString("hex");
  return `tbl_tok_${cleanNum}_${randomHex}`.slice(0, 64);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (session?.user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Only administrators can modify tables." },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = updateTableSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid update payload.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Check table exists
    const [existing] = await db
      .select()
      .from(restaurantTables)
      .where(eq(restaurantTables.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Table not found." },
        },
        { status: 404 }
      );
    }

    const { tableNumber, zone, capacity, isActive, regenerateToken } = validated.data;

    // Check if updating to a conflicting table number
    if (tableNumber && tableNumber.trim() !== existing.tableNumber) {
      const [conflict] = await db
        .select()
        .from(restaurantTables)
        .where(
          and(
            eq(restaurantTables.tableNumber, tableNumber.trim()),
            ne(restaurantTables.id, id)
          )
        )
        .limit(1);

      if (conflict) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DUPLICATE_TABLE",
              message: `Table number "${tableNumber}" is already in use.`,
            },
          },
          { status: 409 }
        );
      }
    }

    const updatePayload: Partial<typeof restaurantTables.$inferInsert> = {};
    if (tableNumber !== undefined) updatePayload.tableNumber = tableNumber.trim();
    if (zone !== undefined) updatePayload.zone = zone.trim();
    if (capacity !== undefined) updatePayload.capacity = capacity;
    if (isActive !== undefined) updatePayload.isActive = isActive;
    if (regenerateToken) {
      updatePayload.qrCodeToken = generateSecureQrToken(
        tableNumber?.trim() || existing.tableNumber
      );
    }

    const [updatedTable] = await db
      .update(restaurantTables)
      .set(updatePayload)
      .where(eq(restaurantTables.id, id))
      .returning();

    // Log Audit Trail
    if (session?.user?.id) {
      await db.insert(auditLogs).values({
        actorUserId: session.user.id,
        action: "TABLE_UPDATED",
        entityType: "TABLE",
        entityId: updatedTable.id,
        metadata: {
          changes: updatePayload,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedTable,
      message: "Table updated successfully.",
    });
  } catch (error) {
    console.error("Error updating table:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update restaurant table.",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (session?.user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Only administrators can delete tables." },
        },
        { status: 403 }
      );
    }

    const [deleted] = await db
      .delete(restaurantTables)
      .where(eq(restaurantTables.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Table not found." },
        },
        { status: 404 }
      );
    }

    if (session?.user?.id) {
      await db.insert(auditLogs).values({
        actorUserId: session.user.id,
        action: "TABLE_DELETED",
        entityType: "TABLE",
        entityId: id,
        metadata: {
          tableNumber: deleted.tableNumber,
          zone: deleted.zone,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { id },
      message: `Table #${deleted.tableNumber} deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete table.",
        },
      },
      { status: 500 }
    );
  }
}
