"use client";

import Link from "next/link";
import MenuImage from "@/components/ui/MenuImage";
import { formatCurrency } from "@/lib/utils";
import { CustomizationProduct } from "./CustomizationModal";
import { Plus, Flame, Sparkles } from "lucide-react";

interface ProductCardProps {
  product: CustomizationProduct;
  categoryName?: string;
  onCustomize: (product: CustomizationProduct) => void;
}

export default function ProductCard({
  product,
  categoryName,
  onCustomize,
}: ProductCardProps) {
  const isSpicy =
    product.name.toLowerCase().includes("betutu") ||
    product.name.toLowerCase().includes("pedas") ||
    product.name.toLowerCase().includes("gejrot") ||
    product.description?.toLowerCase().includes("rawit");

  const isBestseller =
    product.name.toLowerCase().includes("wagyu") ||
    product.name.toLowerCase().includes("betutu") ||
    product.name.toLowerCase().includes("kecombrang");

  return (
    <article aria-label={product.name} className="group glass-card bg-white rounded-card overflow-hidden shadow-elevation-1 hover:shadow-elevation-2 border border-sand-300 transition-all flex flex-col justify-between">
      <div>
        {/* Thumbnail Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-200">
          <Link href={`/menu/${product.slug}`}>
            <MenuImage
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {isBestseller && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-amber-500/95 text-stone-950 font-bold text-[10px] shadow-sm backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                <span>Bestseller</span>
              </span>
            )}
            {isSpicy && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-red-500/90 text-white font-bold text-[10px] shadow-sm backdrop-blur-sm">
                <Flame className="w-3 h-3" />
                <span>Pedas</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {categoryName && (
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
              {categoryName}
            </p>
          )}

          <Link href={`/menu/${product.slug}`}>
            <h3 className="font-heading font-bold text-base text-stone-900 group-hover:text-primary transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed min-h-[32px]">
            {product.description || "Hidangan otentik khas nusantara dengan bumbu rempah pilihan."}
          </p>
        </div>
      </div>

      {/* Card Footer: Price & Action */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex items-center justify-between gap-2 border-t border-sand-100 mt-2">
        <div>
          <span className="text-[10px] text-stone-400 font-medium block">
            Harga mulai
          </span>
          <span className="font-heading font-bold text-sm sm:text-base text-stone-900">
            {formatCurrency(product.priceMinor)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onCustomize(product)}
          className="px-3.5 py-2 rounded-button bg-sand-100 hover:bg-primary hover:text-white text-stone-800 text-xs font-semibold transition-all flex items-center gap-1.5 border border-sand-300 hover:border-primary shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Pesan</span>
        </button>
      </div>
    </article>
  );
}
