import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { desc, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const logs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    const actorIds = Array.from(
      new Set(logs.map((l) => l.actorUserId).filter(Boolean))
    ) as string[];

    let userMap = new Map();
    if (actorIds.length > 0) {
      const userRows = await db
        .select({ id: users.id, name: users.name, email: users.email, role: users.role })
        .from(users)
        .where(inArray(users.id, actorIds));
      userMap = new Map(userRows.map((u) => [u.id, u]));
    }

    const enrichedLogs = logs.map((log) => ({
      ...log,
      actor: log.actorUserId ? userMap.get(log.actorUserId) || null : null,
    }));

    return NextResponse.json({ success: true, data: enrichedLogs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Gagal mengambil audit logs." } },
      { status: 500 }
    );
  }
}
