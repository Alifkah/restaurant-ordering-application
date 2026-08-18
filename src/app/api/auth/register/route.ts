import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { registerSchema } from "@/lib/validation/auth";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_ip";
    const limiter = rateLimit(`register_${ip}`, { windowSeconds: 60, maxRequests: 10 });
    if (!limiter.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak permintaan registrasi. Silakan coba lagi dalam ${limiter.resetSeconds} detik.`,
        },
        { status: 429 }
      );
    }
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data yang dimasukkan tidak valid.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already taken
    const [existingUser] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar. Silakan login atau gunakan email lain.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert customer user
    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "customer",
        status: "active",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil didaftarkan. Silakan masuk.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in registration endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal server saat mendaftar.",
      },
      { status: 500 }
    );
  }
}
