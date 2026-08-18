import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { categories, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (session?.user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = updateCategorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload." } },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(categories)
      .set(validated.data)
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Category not found." } },
        { status: 404 }
      );
    }

    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || null,
      action: "CATEGORY_UPDATED",
      entityType: "CATEGORY",
      entityId: id,
      metadata: validated.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to update category." } },
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
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    await db
      .update(categories)
      .set({ isActive: false })
      .where(eq(categories.id, id));

    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || null,
      action: "CATEGORY_DEACTIVATED",
      entityType: "CATEGORY",
      entityId: id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to deactivate category." } },
      { status: 500 }
    );
  }
}
