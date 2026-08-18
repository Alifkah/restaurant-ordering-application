import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { categories, auditLogs } from "@/db/schema";
import { asc } from "drizzle-orm";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const list = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder));

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve categories.",
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
          error: { code: "FORBIDDEN", message: "Only administrators can create categories." },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createCategorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid category payload.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(categories)
      .values(validated.data)
      .returning();

    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || null,
      action: "CATEGORY_CREATED",
      entityType: "CATEGORY",
      entityId: created.id,
      metadata: { name: created.name, slug: created.slug },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new category.",
        },
      },
      { status: 500 }
    );
  }
}
