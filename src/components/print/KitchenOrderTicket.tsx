"use client";

import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { Printer, X } from "lucide-react";

export interface KOTItem {
  name: string;
  quantity: number;
  note?: string | null;
  options?: Array<{ name: string; priceDeltaMinor?: number }>;
  lineTotalMinor?: number;
}

export interface KOTData {
  orderId: string;
  orderNumber: string;
  orderType: "dine_in" | "takeaway";
  tableNumber?: string | null;
  tableZone?: string | null;
  status: string;
  paymentStatus?: "paid" | "pending" | "failed";
  paymentProvider?: string;
  customerNote?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  createdAt: string | Date;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  items: KOTItem[];
}

interface KitchenOrderTicketProps {
  kot: KOTData;
  isOpen: boolean;
  onClose: () => void;
  autoPrint?: boolean;
}

export default function KitchenOrderTicket({
  kot,
  isOpen,
  onClose,
  autoPrint = false,
}: KitchenOrderTicketProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(kot.createdAt).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const isDineIn = kot.orderType === "dine_in";
  const isPaid = kot.paymentStatus === "paid";

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (isOpen && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      {/* Modal Actions Bar (Hidden in Print) */}
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-sand-300 overflow-hidden flex flex-col print:shadow-none print:border-none print:max-w-none print:w-full">
        <div className="p-4 border-b border-sand-200 flex items-center justify-between bg-sand-50 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-stone-900">
                Kitchen Order Ticket (KOT)
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {kot.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-button bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Struk</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-button text-stone-400 hover:text-stone-700 hover:bg-sand-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monospace Printable Thermal Receipt Container */}
        <div
          ref={printAreaRef}
          id="kot-thermal-print"
          className="p-6 bg-white text-black font-mono text-xs leading-relaxed print:p-0 print:w-[80mm] print:mx-auto select-text"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-black space-y-1">
            <p className="font-extrabold text-base tracking-wider uppercase">
              NUSANTARA ARTISAN
            </p>
            <p className="text-[11px]">KITCHEN & LOUNGE</p>
            <p className="text-[10px] text-stone-600">
              Jl. Artisan No. 8, Jakarta • (021) 555-8989
            </p>
          </div>

          {/* Big Table / Takeaway Banner */}
          <div className="py-3 text-center border-b-2 border-dashed border-black">
            {isDineIn ? (
              <div className="space-y-0.5">
                <span className="inline-block text-lg sm:text-xl font-black bg-black text-white px-3 py-1 uppercase tracking-widest">
                  *** TABLE {kot.tableNumber || "00"} ***
                </span>
                {kot.tableZone && (
                  <p className="text-[11px] font-bold mt-1 uppercase">
                    ZONE: {kot.tableZone} (DINE-IN)
                  </p>
                )}
              </div>
            ) : (
              <span className="inline-block text-lg font-black bg-black text-white px-3 py-1 uppercase tracking-widest">
                *** TAKEAWAY ORDER ***
              </span>
            )}
          </div>

          {/* Ticket Metadata */}
          <div className="py-2.5 border-b border-dashed border-black text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Order No:</span>
              <span className="font-bold">{kot.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{formattedDate}</span>
            </div>
            {kot.guestName && (
              <div className="flex justify-between">
                <span>Guest:</span>
                <span className="font-bold">{kot.guestName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className={`font-bold ${isPaid ? "text-emerald-800" : "text-amber-800 font-black"}`}>
                {isPaid ? "[PAID]" : "[UNPAID - PAY AT CASHIER]"}
              </span>
            </div>
          </div>

          {/* Item List */}
          <div className="py-3 border-b-2 border-dashed border-black space-y-3">
            <div className="flex justify-between text-[11px] font-bold pb-1 border-b border-black">
              <span>ITEM / MODIFIER</span>
              <span>QTY</span>
            </div>

            {kot.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-start text-xs font-bold">
                  <span className="flex-1 pr-2">
                    {idx + 1}. {item.name}
                  </span>
                  <span className="text-sm font-black flex-shrink-0">
                    x{item.quantity}
                  </span>
                </div>

                {/* Modifiers / Options */}
                {item.options && item.options.length > 0 && (
                  <div className="pl-4 text-[11px] text-stone-700 italic">
                    {item.options.map((opt, oIdx) => (
                      <p key={oIdx}>+ {opt.name}</p>
                    ))}
                  </div>
                )}

                {/* Item Specific Note */}
                {item.note && (
                  <div className="pl-4 text-[10px] font-bold text-stone-800">
                    &gt;&gt; Note: &ldquo;{item.note}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Kitchen Special Instructions */}
          {kot.customerNote && (
            <div className="py-2.5 border-b border-dashed border-black text-[11px] bg-stone-50 p-2 my-2 border border-stone-300">
              <p className="font-bold uppercase tracking-wider text-[10px]">
                SPECIAL INSTRUCTIONS:
              </p>
              <p className="font-bold mt-0.5">{kot.customerNote}</p>
            </div>
          )}

          {/* Financial Summary */}
          <div className="py-2.5 border-b border-dashed border-black text-[11px] space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(kot.subtotalMinor)}</span>
            </div>
            <div className="flex justify-between">
              <span>Resto Tax (PB1 10%):</span>
              <span>{formatCurrency(kot.taxMinor)}</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-stone-400">
              <span>TOTAL BILL:</span>
              <span className="text-sm font-black">{formatCurrency(kot.totalMinor)}</span>
            </div>
          </div>

          {/* Footer Barcode / Thank you */}
          <div className="pt-3 text-center text-[10px] space-y-1">
            <p className="font-bold tracking-widest">--- KITCHEN COPY ---</p>
            <p>Please serve freshly prepared.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
