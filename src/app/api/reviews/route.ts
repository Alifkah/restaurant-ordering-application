import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reviews, orders, orderItems, users } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  orderId: z.string().uuid("Invalid order ID"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().nullable(),
  imageUrls: z.array(z.string().url()).max(3).optional().nullable(),
  imagePublicIds: z.array(z.string()).max(3).optional().nullable(),
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
        imageUrls: reviews.imageUrls,
        imagePublicIds: reviews.imagePublicIds,
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
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to retrieve reviews." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in to write a verified review." } },
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
            message: "Invalid review submission data.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { productId, orderId, rating, comment, imageUrls, imagePublicIds } = validated.data;
    const customerId = session?.user?.id || "00000000-0000-0000-0000-000000000001";

    // 1. Verify eligibility: check if order exists
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found." } },
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
            message: "Reviews can only be submitted for dishes included in this verified order.",
          },
        },
        { status: 403 }
      );
    }

    // 3. Create review with photo attachments
    const [createdReview] = await db
      .insert(reviews)
      .values({
        customerId,
        productId,
        orderId,
        rating,
        comment: comment?.trim() || null,
        imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : null,
        imagePublicIds: imagePublicIds && imagePublicIds.length > 0 ? imagePublicIds : null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: createdReview,
        message: "Thank you! Your verified photo review has been submitted.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to submit review." } },
      { status: 500 }
    );
  }
}
