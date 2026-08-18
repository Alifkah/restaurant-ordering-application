import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { products, productOptions, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const optionInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  priceDeltaMinor: z.number().int().default(0),
  isAvailable: z.boolean().default(true),
});

const updateProductSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  priceMinor: z.number().int().optional(),
  currency: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  imagePublicId: z.string().optional().nullable(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  options: z.array(optionInputSchema).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan." } },
        { status: 404 }
      );
    }

    const options = await db
      .select()
      .from(productOptions)
      .where(eq(productOptions.productId, id));

    return NextResponse.json({ success: true, data: { ...product, options } });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Gagal mengambil data produk." } },
      { status: 500 }
    );
  }
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
    const validated = updateProductSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload." } },
        { status: 400 }
      );
    }

    const { options, ...productData } = validated.data;

    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan." } },
        { status: 404 }
      );
    }

    // If options were provided, replace options
    if (options) {
      await db.delete(productOptions).where(eq(productOptions.productId, id));
      for (const opt of options) {
        await db.insert(productOptions).values({
          productId: id,
          name: opt.name,
          description: opt.description || null,
          priceDeltaMinor: opt.priceDeltaMinor,
          isAvailable: opt.isAvailable,
        });
      }
    }

    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || null,
      action: "PRODUCT_UPDATED",
      entityType: "PRODUCT",
      entityId: id,
      metadata: validated.data,
    });

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Gagal memperbarui produk." } },
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
      .update(products)
      .set({ isAvailable: false })
      .where(eq(products.id, id));

    await db.insert(auditLogs).values({
      actorUserId: session?.user?.id || null,
      action: "PRODUCT_DEACTIVATED",
      entityType: "PRODUCT",
      entityId: id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deactivating product:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Gagal menonaktifkan produk." } },
      { status: 500 }
    );
  }
}
