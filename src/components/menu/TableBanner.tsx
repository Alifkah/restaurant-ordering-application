"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { UtensilsCrossed, ShoppingBag, Edit3, X, Check } from "lucide-react";

export default function TableBanner() {
  const {
    diningOption,
    setDiningOption,
    tableNumber,
    setTableNumber,
    tableZone,
    clearTable,
  } = useCart();

  const [isEditing, setIsEditing] = useState(false);
  const [newTableInput, setNewTableInput] = useState("");

  if (diningOption !== "dine_in" || !tableNumber) {
    return null;
  }

  const handleSaveNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTableInput.trim()) {
      setTableNumber(newTableInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white border-y border-emerald-500/30 px-4 py-2.5 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left Side: Table & Zone Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center flex-shrink-0 animate-pulse">
            <UtensilsCrossed className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white uppercase tracking-wider text-xs">
                📍 Dine-In Active: Table #{tableNumber}
              </span>
              {tableZone && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold">
                  {tableZone}
                </span>
              )}
            </div>
            <p className="text-stone-300 text-[11px]">
              Orders will be prepared and served directly to this table.
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <form onSubmit={handleSaveNewTable} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newTableInput}
                onChange={(e) => setNewTableInput(e.target.value)}
                placeholder="New Table #"
                autoFocus
                className="w-24 px-2 py-1 rounded bg-stone-800 border border-emerald-400 text-white text-xs outline-none"
              />
              <button
                type="submit"
                className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Save Table Number"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-300 transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNewTableInput(tableNumber);
                setIsEditing(true);
              }}
              className="px-2.5 py-1 rounded-md bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3 h-3 text-amber-400" />
              <span>Change Table</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setDiningOption("takeaway");
              clearTable();
            }}
            className="px-2.5 py-1 rounded-md bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <ShoppingBag className="w-3 h-3 text-emerald-400" />
            <span>Switch to Takeaway</span>
          </button>
        </div>
      </div>
    </div>
  );
}
