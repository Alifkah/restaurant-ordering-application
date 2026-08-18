import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reviews, orders, orderItems, users } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string().uuid("Product ID tidak valid"),
  orderId: z.string().uuid("Order ID tidak valid"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");

    const query = db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        orderId: reviews.orderId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        customerName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.customerId, users.id))
      .orderBy(desc(reviews.createdAt));

    let reviewList = await query;

    if (productId) {
      reviewList = reviewList.filter((r) => r.productId === productId);
    }

    return NextResponse.json({
      success: true,
      data: reviewList,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Gagal mengambil ulasan." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu untuk menulis ulasan." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = createReviewSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Data ulasan tidak valid.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { productId, orderId, rating, comment } = validated.data;
    const customerId = session?.user?.id || "00000000-0000-0000-0000-000000000001";

    // 1. Verify eligibility: check if order exists
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Nomor pesanan tidak ditemukan." } },
        { status: 404 }
      );
    }

    // 2. Check if product was part of this order
    const [matchedItem] = await db
      .select()
      .from(orderItems)
      .where(and(eq(orderItems.orderId, orderId), eq(orderItems.productId, productId)))
      .limit(1);

    if (!matchedItem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Ulasan hanya dapat diberikan untuk hidangan yang tercantum dalam pesanan ini.",
          },
        },
        { status: 403 }
      );
    }

    // 3. Create review
    const [createdReview] = await db
      .insert(reviews)
      .values({
        customerId,
        productId,
        orderId,
        rating,
        comment: comment?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: createdReview,
        message: "Terima kasih! Ulasan Anda telah terkirim.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Gagal mengirim ulasan." } },
      { status: 500 }
    );
  }
}
