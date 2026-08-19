"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

export interface CartItemOption {
  id: string;
  name: string;
  priceDeltaMinor: number;
}

export interface CartItem {
  id: string; // Unique combination key: productId + sorted options + note
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  unitPriceMinor: number;
  selectedOptions: CartItemOption[];
  note?: string;
  quantity: number;
  lineTotalMinor: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "lineTotalMinor">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  formattedSubtotal: string;
  formattedTax: string;
  formattedTotal: string;
  diningOption: "dine_in" | "takeaway";
  setDiningOption: (opt: "dine_in" | "takeaway") => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  tableId: string | null;
  setTableId: (id: string | null) => void;
  tableZone: string | null;
  setTableZone: (zone: string | null) => void;
  clearTable: () => void;
  customerNote: string;
  setCustomerNote: (note: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "nusantara_cart_v2";

function generateCartItemId(
  productId: string,
  selectedOptions: CartItemOption[],
  note?: string
): string {
  const optionsKey = selectedOptions
    .map((o) => o.id)
    .sort()
    .join(",");
  const noteKey = (note || "").trim().toLowerCase();
  return `${productId}_${optionsKey}_${noteKey}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [diningOption, setDiningOption] = useState<"dine_in" | "takeaway">("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableZone, setTableZone] = useState<string | null>(null);
  const [customerNote, setCustomerNote] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart and table from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.items) setItems(parsed.items);
        if (parsed.diningOption) setDiningOption(parsed.diningOption);
        if (parsed.tableNumber) setTableNumber(parsed.tableNumber);
        if (parsed.tableId) setTableId(parsed.tableId);
        if (parsed.tableZone) setTableZone(parsed.tableZone);
        if (parsed.customerNote) setCustomerNote(parsed.customerNote);
      }

      // Check table session
      const savedTable = localStorage.getItem("nusantara_table_session");
      if (savedTable) {
        const parsedTable = JSON.parse(savedTable);
        if (parsedTable.tableNumber) setTableNumber(parsedTable.tableNumber);
        if (parsedTable.tableId) setTableId(parsedTable.tableId);
        if (parsedTable.zone) setTableZone(parsedTable.zone);
        setDiningOption("dine_in");
      }
    } catch (e) {
      console.warn("Failed to load cart from storage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items,
          diningOption,
          tableNumber,
          tableId,
          tableZone,
          customerNote,
        })
      );
    } catch (e) {
      console.warn("Failed to save cart to storage:", e);
    }
  }, [items, diningOption, tableNumber, tableId, tableZone, customerNote, isLoaded]);

  const addItem = (item: Omit<CartItem, "id" | "lineTotalMinor">) => {
    const id = generateCartItemId(item.productId, item.selectedOptions, item.note);

    const optionsDeltaTotal = item.selectedOptions.reduce(
      (sum, opt) => sum + opt.priceDeltaMinor,
      0
    );
    const itemUnitPrice = item.unitPriceMinor + optionsDeltaTotal;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === id);

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + item.quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          lineTotalMinor: itemUnitPrice * newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        ...item,
        id,
        lineTotalMinor: itemUnitPrice * item.quantity,
      };
      return [...prev, newItem];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const optionsDeltaTotal = item.selectedOptions.reduce(
            (sum, opt) => sum + opt.priceDeltaMinor,
            0
          );
          const itemUnitPrice = item.unitPriceMinor + optionsDeltaTotal;
          return {
            ...item,
            quantity: newQuantity,
            lineTotalMinor: itemUnitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCustomerNote("");
  };

  const clearTable = () => {
    setTableNumber("");
    setTableId(null);
    setTableZone(null);
    try {
      localStorage.removeItem("nusantara_table_session");
    } catch (e) {
      console.warn("Failed to clear table session:", e);
    }
  };

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotalMinor = useMemo(
    () => items.reduce((sum, item) => sum + item.lineTotalMinor, 0),
    [items]
  );

  // PB1 Tax 10%
  const taxMinor = useMemo(
    () => Math.round(subtotalMinor * 0.1),
    [subtotalMinor]
  );

  const totalMinor = useMemo(
    () => subtotalMinor + taxMinor,
    [subtotalMinor, taxMinor]
  );

  const formattedSubtotal = useMemo(
    () => formatCurrency(subtotalMinor, "IDR", "Rp", 0),
    [subtotalMinor]
  );

  const formattedTax = useMemo(
    () => formatCurrency(taxMinor, "IDR", "Rp", 0),
    [taxMinor]
  );

  const formattedTotal = useMemo(
    () => formatCurrency(totalMinor, "IDR", "Rp", 0),
    [totalMinor]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalMinor,
        taxMinor,
        totalMinor,
        formattedSubtotal,
        formattedTax,
        formattedTotal,
        diningOption,
        setDiningOption,
        tableNumber,
        setTableNumber,
        tableId,
        setTableId,
        tableZone,
        setTableZone,
        clearTable,
        customerNote,
        setCustomerNote,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
