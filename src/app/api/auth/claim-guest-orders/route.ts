import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const claimSchema = z.object({
  orderId: z.string().uuid("Invalid order ID format"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = claimSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input payload",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { orderId, email, password, name } = validated.data;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verify that order exists
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "The specified order was not found.",
          },
        },
        { status: 404 }
      );
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Find if user already exists with this email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    let targetUserId: string;

    if (existingUser) {
      // Update user password and name if missing
      await db
        .update(users)
        .set({
          passwordHash: hashedPassword,
          name: name?.trim() || existingUser.name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));

      targetUserId = existingUser.id;
    } else {
      // Create new user account
      const [newUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash: hashedPassword,
          name: name?.trim() || "Artisan Guest",
          role: "customer",
          status: "active",
        })
        .returning();

      targetUserId = newUser.id;
    }

    // 4. Link order to user account
    await db
      .update(orders)
      .set({
        customerId: targetUserId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return NextResponse.json({
      success: true,
      data: {
        message: "Account created and order saved to your profile!",
        userId: targetUserId,
        orderId,
      },
    });
  } catch (error) {
    console.error("Error claiming guest order:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create account and save order.",
        },
      },
      { status: 500 }
    );
  }
}
