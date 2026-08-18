"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import CustomizationModal, { CustomizationProduct } from "./CustomizationModal";
import { Search, X, UtensilsCrossed, Flame, Sparkles } from "lucide-react";

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
}

export interface CatalogProduct extends CustomizationProduct {
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  isAvailable: boolean;
  sortOrder: number;
}

interface MenuCatalogClientProps {
  categories: CatalogCategory[];
  products: CatalogProduct[];
}

export default function MenuCatalogClient({
  categories,
  products,
}: MenuCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "bestseller" | "spicy">("all");
  const [customizingProduct, setCustomizingProduct] = useState<CustomizationProduct | null>(null);

  // Map category slug to products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description?.toLowerCase().includes(q);
        const matchCategory = product.categoryName?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCategory) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategorySlug !== "all") {
        if (product.categorySlug !== selectedCategorySlug) {
          return false;
        }
      }

      // 3. Dietary / Tag filter
      if (activeFilter === "bestseller") {
        const isBestseller =
          product.name.toLowerCase().includes("wagyu") ||
          product.name.toLowerCase().includes("betutu") ||
          product.name.toLowerCase().includes("kecombrang") ||
          product.name.toLowerCase().includes("rendang");
        if (!isBestseller) return false;
      }

      if (activeFilter === "spicy") {
        const isSpicy =
          product.name.toLowerCase().includes("betutu") ||
          product.name.toLowerCase().includes("spicy") ||
          product.name.toLowerCase().includes("pedas") ||
          product.name.toLowerCase().includes("chili") ||
          product.description?.toLowerCase().includes("chili") ||
          product.description?.toLowerCase().includes("rawit");
        if (!isSpicy) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategorySlug, activeFilter]);

  return (
    <div className="space-y-8">
      {/* Top Search & Filter Bar */}
      <div className="glass-card bg-white/90 p-4 sm:p-5 rounded-card border border-sand-300 shadow-elevation-1 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (wagyu rendang, noodles, palm sugar coffee...)"
              className="w-full pl-10 pr-10 py-2.5 rounded-button bg-sand-50 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeFilter === "all"
                  ? "bg-stone-900 text-white"
                  : "bg-sand-200 text-stone-700 hover:bg-sand-300"
              }`}
            >
              All Dishes
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("bestseller")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                activeFilter === "bestseller"
                  ? "bg-amber-500 text-stone-950 font-semibold shadow-sm"
                  : "bg-sand-200 text-stone-700 hover:bg-sand-300"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Bestseller</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("spicy")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                activeFilter === "spicy"
                  ? "bg-red-500 text-white font-semibold shadow-sm"
                  : "bg-sand-200 text-stone-700 hover:bg-sand-300"
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Spicy Dishes</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Sticky Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-sand-200">
          <button
            type="button"
            onClick={() => setSelectedCategorySlug("all")}
            className={`px-4 py-2 rounded-button text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
              selectedCategorySlug === "all"
                ? "bg-primary text-white shadow-elevation-1"
                : "bg-sand-100 text-stone-700 hover:bg-sand-200"
            }`}
          >
            All ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.categorySlug === cat.slug).length;
            const isSelected = selectedCategorySlug === cat.slug;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`px-4 py-2 rounded-button text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? "bg-primary text-white shadow-elevation-1"
                    : "bg-sand-100 text-stone-700 hover:bg-sand-200"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid / Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center glass-card bg-white/90 rounded-card border border-sand-300">
          <div className="w-14 h-14 rounded-full bg-sand-200 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-stone-800 mb-1">
            No Dishes Found
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mb-4">
            We couldn&apos;t find any items matching &ldquo;{searchQuery}&rdquo;. Try another search term or reset your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategorySlug("all");
              setActiveFilter("all");
            }}
            className="px-4 py-2 rounded-button bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={product.categoryName}
              onCustomize={(prod) => setCustomizingProduct(prod)}
            />
          ))}
        </div>
      )}

      {/* Customization Modal */}
      <CustomizationModal
        product={customizingProduct}
        isOpen={!!customizingProduct}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
