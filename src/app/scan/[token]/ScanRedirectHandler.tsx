"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { UtensilsCrossed, CheckCircle2, MapPin, Users, Loader2 } from "lucide-react";

interface ScanRedirectHandlerProps {
  tableId: string;
  tableNumber: string;
  zone: string;
  capacity: number;
}

export default function ScanRedirectHandler({
  tableId,
  tableNumber,
  zone,
  capacity,
}: ScanRedirectHandlerProps) {
  const router = useRouter();
  const { setDiningOption, setTableNumber, setTableId, setTableZone } = useCart();

  useEffect(() => {
    // 1. Persist to Cart Context
    setDiningOption("dine_in");
    setTableNumber(tableNumber);
    if (setTableId) setTableId(tableId);
    if (setTableZone) setTableZone(zone);

    // 2. Persist to localStorage
    try {
      localStorage.setItem("nusantara_table_session", JSON.stringify({
        tableId,
        tableNumber,
        zone,
        scannedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn("Storage write error:", e);
    }

    // 3. Short delay to display delightful confirmation feedback
    const timer = setTimeout(() => {
      router.push(`/menu?table=${encodeURIComponent(tableNumber)}&zone=${encodeURIComponent(zone)}&tid=${encodeURIComponent(tableId)}`);
    }, 1200);

    return () => clearTimeout(timer);
  }, [tableId, tableNumber, zone, router, setDiningOption, setTableNumber, setTableId, setTableZone]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card bg-white/95 rounded-card p-6 sm:p-8 shadow-elevation-3 border border-emerald-200 text-center space-y-6 animate-scale-up">
        {/* Animated Brand Emblem */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center shadow-elevation-2 animate-bounce-subtle">
            <UtensilsCrossed className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Heading & Table Identification */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            Table Verified & Connected
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900">
            Table #{tableNumber}
          </h1>
          <p className="text-sm text-stone-600">
            Welcome to Nusantara Artisan Kitchen & Lounge
          </p>
        </div>

        {/* Table Details Card */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-button bg-sand-100/80 border border-sand-300 text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white text-primary shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Zone</p>
              <p className="text-xs font-semibold text-stone-800">{zone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white text-primary shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Capacity</p>
              <p className="text-xs font-semibold text-stone-800">Up to {capacity} Guests</p>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs font-medium text-stone-500">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Opening gourmet menu catalog...</span>
        </div>
      </div>
    </div>
  );
}
