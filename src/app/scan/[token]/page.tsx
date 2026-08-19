import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { restaurantTables } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AlertTriangle, ArrowRight } from "lucide-react";
import ScanRedirectHandler from "./ScanRedirectHandler";

export const metadata: Metadata = {
  title: "Table QR Scanner | Nusantara Artisan Kitchen",
  description: "Dine-in QR Code Table Ordering verification and session activation.",
};

interface ScanPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function ScanPage({ params }: ScanPageProps) {
  const { token } = await params;

  if (!token) {
    redirect("/menu");
  }

  // 1. Query Table by secure QR token
  const [table] = await db
    .select()
    .from(restaurantTables)
    .where(eq(restaurantTables.qrCodeToken, token.trim()))
    .limit(1);

  // 2. If Table not found or inactive, render error screen
  if (!table || !table.isActive) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card bg-white/95 rounded-card p-6 sm:p-8 shadow-elevation-2 border border-red-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 mx-auto flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-stone-900">
              Table QR Code Inactive
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              This table QR code is invalid, unassigned, or temporarily inactive. Please ask our service staff for assistance.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/menu"
              className="w-full py-3 rounded-button bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-elevation-1"
            >
              <span>Browse General Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-button bg-sand-100 text-stone-700 font-medium text-xs hover:bg-sand-200 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Valid Table: Hand off to Client Redirect Handler to persist to LocalStorage / Cart Context
  return (
    <ScanRedirectHandler
      tableId={table.id}
      tableNumber={table.tableNumber}
      zone={table.zone}
      capacity={table.capacity}
    />
  );
}
