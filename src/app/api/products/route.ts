import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { products, productOptions, auditLogs } from "@/db/schema";
import { asc, inArray } from "drizzle-orm";
import { z } from "zod";

const optionInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  priceDeltaMinor: z.number().int().default(0),
  isAvailable: z.boolean().default(true),
});

const createProductSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  priceMinor: z.number().int().min(0, "Price cannot be negative"),
  currency: z.string().default("IDR"),
  imageUrl: z.string().optional().nullable(),
  imagePublicId: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  options: z.array(optionInputSchema).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const categoryId = req.nextUrl.searchParams.get("categoryId");

    const query = db
      .select()
      .from(products)
      .orderBy(asc(products.sortOrder));

    let productList = await query;
    if (categoryId) {
      productList = productList.filter((p) => p.categoryId === categoryId);
    }

    const productIds = productList.map((p) => p.id);
    let optionsList: Array<typeof productOptions.$inferSelect> = [];
    if (productIds.length > 0) {
      optionsList = await db
        .select()
        .from(productOptions)
        .where(inArray(productOptions.productId, productIds));
    }

    const fullProducts = productList.map((p) => ({
      ...p,
      options: optionsList.filter((o) => o.productId === p.id),
    }));

    return NextResponse.json({ success: true, data: fullProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to retrieve products." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createProductSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid product data payload.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { options, ...productData } = validated.data;

    const [createdProduct] = await db
      .insert(products)
      .values(productData)
      .returning();

    // Insert options if provided
    if (options && options.length > 0) {
      for (const opt of options) {
        await db.insert(productOptions).values({
          productId: createdProduct.id,
          name: opt.name,
          description: opt.description || null,
          priceDeltaMinor: opt.priceDeltaMinor,
          isAvailable: opt.isAvailable,
        });
      }
    }

    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || null,
      action: "PRODUCT_CREATED",
      entityType: "PRODUCT",
      entityId: createdProduct.id,
      metadata: { name: createdProduct.name, priceMinor: createdProduct.priceMinor },
    });

    return NextResponse.json({ success: true, data: createdProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to create new product." } },
      { status: 500 }
    );
  }
}
