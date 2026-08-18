import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST() {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demo";
    const apiKey = process.env.CLOUDINARY_API_KEY || "123456789";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "mock_secret";

    // Generate SHA1 signature for Cloudinary upload params
    const folder = "restaurant_menu";
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

    return NextResponse.json({
      success: true,
      data: {
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
      },
    });
  } catch (error) {
    console.error("Error generating media signature:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to generate media upload signature." } },
      { status: 500 }
    );
  }
}
