import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { restaurantSettings, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSettingsSchema = z.object({
  restaurantName: z.string().optional(),
  isAcceptingOrders: z.boolean().optional(),
  currency: z.string().optional(),
  currencySymbol: z.string().optional(),
  currencyDecimals: z.number().int().optional(),
  timezone: z.string().optional(),
  operatingHours: z.record(z.string(), z.any()).optional(),
  contactEmail: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const [settings] = await db
      .select()
      .from(restaurantSettings)
      .limit(1);

    return NextResponse.json({
      success: true,
      data: settings || null,
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to retrieve restaurant settings." } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = updateSettingsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload." } },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(restaurantSettings)
      .limit(1);

    let updated;
    if (existing) {
      const [res] = await db
        .update(restaurantSettings)
        .set({
          ...validated.data,
          updatedAt: new Date(),
        })
        .where(eq(restaurantSettings.id, existing.id))
        .returning();
      updated = res;
    } else {
      const [res] = await db
        .insert(restaurantSettings)
        .values({
          restaurantName: validated.data.restaurantName || "Nusantara Artisan Kitchen",
          isAcceptingOrders: validated.data.isAcceptingOrders ?? true,
          currency: validated.data.currency || "IDR",
          currencySymbol: validated.data.currencySymbol || "Rp",
          currencyDecimals: validated.data.currencyDecimals ?? 0,
          ...validated.data,
        })
        .returning();
      updated = res;
    }

    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || null,
      action: "SETTINGS_UPDATED",
      entityType: "SETTINGS",
      entityId: updated.id,
      metadata: validated.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to update restaurant settings." } },
      { status: 500 }
    );
  }
}
