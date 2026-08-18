"use client";

import { useState, useEffect } from "react";
import { useCart, CartItemOption } from "@/context/CartContext";
import MenuImage from "@/components/ui/MenuImage";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Utensils,
} from "lucide-react";

export interface CustomizationOption {
  id: string;
  name: string;
  description?: string | null;
  priceDeltaMinor: number;
  isAvailable?: boolean;
}

export interface CustomizationProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceMinor: number;
  currency?: string;
  imageUrl?: string | null;
  options?: CustomizationOption[];
}

interface CustomizationModalProps {
  product: CustomizationProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomizationModal({
  product,
  isOpen,
  onClose,
}: CustomizationModalProps) {
  const { addItem, setIsCartOpen } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [isAdded, setIsAdded] = useState(false);

  // Initialize modal state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNote("");
      setIsAdded(false);
      // Auto-select first free option if available
      const defaultOption = product.options?.find(
        (o) => o.priceDeltaMinor === 0 && o.isAvailable !== false
      );
      if (defaultOption) {
        setSelectedOptionIds([defaultOption.id]);
      } else {
        setSelectedOptionIds([]);
      }
    }
  }, [product, isOpen]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Toggle option selection
  const handleToggleOption = (option: CustomizationOption) => {
    setSelectedOptionIds((prev) => {
      // Check if option belongs to a single-choice group (e.g. options sharing same prefix before colon)
      const prefix = option.name.includes(":")
        ? option.name.split(":")[0].trim()
        : null;

      if (prefix) {
        // Remove other options with same prefix
        const withoutSamePrefix = prev.filter((id) => {
          const opt = product.options?.find((o) => o.id === id);
          if (!opt) return false;
          const optPrefix = opt.name.includes(":")
            ? opt.name.split(":")[0].trim()
            : null;
          return optPrefix !== prefix;
        });
        return [...withoutSamePrefix, option.id];
      }

      // Otherwise treat as multi-select checkbox
      if (prev.includes(option.id)) {
        return prev.filter((id) => id !== option.id);
      }
      return [...prev, option.id];
    });
  };

  // Calculate live reactive price
  const selectedOptionsList: CartItemOption[] = (product.options || [])
    .filter((o) => selectedOptionIds.includes(o.id))
    .map((o) => ({
      id: o.id,
      name: o.name,
      priceDeltaMinor: o.priceDeltaMinor,
    }));

  const optionsTotalDelta = selectedOptionsList.reduce(
    (sum, opt) => sum + opt.priceDeltaMinor,
    0
  );

  const unitTotal = product.priceMinor + optionsTotalDelta;
  const grandTotal = unitTotal * quantity;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      unitPriceMinor: product.priceMinor,
      selectedOptions: selectedOptionsList,
      note: note.trim() || undefined,
      quantity,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
      setIsCartOpen(true);
    }, 400);
  };

  // Group options by category / prefix if available
  const optionGroups = (product.options || []).reduce<
    Record<string, CustomizationOption[]>
  >((acc, opt) => {
    const groupName = opt.name.includes(":")
      ? opt.name.split(":")[0].trim()
      : "Add-ons & Options";

    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(opt);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-[20px] sm:rounded-card shadow-elevation-3 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-slide-up">
        {/* Modal Hero Image */}
        <div className="relative h-48 sm:h-56 w-full bg-sand-200 flex-shrink-0">
          <MenuImage
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-heading text-lg sm:text-xl font-bold leading-tight">
              {product.name}
            </h3>
            <p className="text-amber-400 font-bold text-sm mt-0.5">
              From {formatCurrency(product.priceMinor)}
            </p>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {product.description && (
            <div>
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Culinary Description
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Option Groups */}
          {Object.entries(optionGroups).map(([groupTitle, options]) => (
            <div key={groupTitle} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-primary" />
                  <span>{groupTitle}</span>
                </h4>
                <span className="text-[11px] text-stone-500 font-medium">
                  {options.some((o) => o.name.includes(":"))
                    ? "Choose 1 option"
                    : "Optional"}
                </span>
              </div>

              <div className="space-y-2">
                {options.map((option) => {
                  const isSelected = selectedOptionIds.includes(option.id);
                  const cleanOptionName = option.name.includes(":")
                    ? option.name.split(":")[1].trim()
                    : option.name;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleToggleOption(option)}
                      className={`w-full p-3 rounded-button border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-primary-50/70 border-primary shadow-sm"
                          : "bg-white border-sand-300 hover:border-sand-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected
                              ? "bg-primary border-primary text-white"
                              : "border-stone-400 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-stone-800">
                          {cleanOptionName}
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-stone-700">
                        {option.priceDeltaMinor > 0
                          ? `+${formatCurrency(option.priceDeltaMinor)}`
                          : "Free"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Kitchen Note */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Special Instructions for the Kitchen
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Sambal on the side, no fried shallots, allergy notice..."
              rows={2}
              className="w-full p-3 rounded-button bg-sand-50/60 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 outline-none resize-none transition-all"
            />
          </div>
        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="p-4 sm:p-5 border-t border-sand-300 bg-sand-50/90 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-sand-300 rounded-button bg-white shadow-sm overflow-hidden flex-shrink-0">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2.5 text-stone-600 hover:bg-sand-100 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-bold text-stone-800 min-w-[28px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2.5 text-stone-600 hover:bg-sand-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Basket Button with reactive price */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 rounded-button text-white font-semibold text-xs sm:text-sm shadow-elevation-1 transition-all flex items-center justify-between ${
              isAdded
                ? "bg-emerald-600"
                : "bg-primary hover:bg-primary-hover active:scale-[0.99]"
            }`}
          >
            <div className="flex items-center gap-2">
              {isAdded ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
              <span>{isAdded ? "Added to Basket!" : "Add to Dining Basket"}</span>
            </div>
            <span className="font-bold">{formatCurrency(grandTotal)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
