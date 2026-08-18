"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart, CartItemOption } from "@/context/CartContext";
import MenuImage from "@/components/ui/MenuImage";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Utensils,
  ArrowLeft,
  ShieldCheck,
  Star,
} from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
  description?: string | null;
  priceDeltaMinor: number;
  isAvailable?: boolean;
}

interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceMinor: number;
  currency?: string;
  imageUrl?: string | null;
  categoryName?: string;
  options?: OptionItem[];
}

interface ProductDetailClientProps {
  product: ProductDetailData;
  relatedProducts?: Array<{
    id: string;
    name: string;
    slug: string;
    priceMinor: number;
    imageUrl?: string | null;
  }>;
}

export default function ProductDetailClient({
  product,
  relatedProducts = [],
}: ProductDetailClientProps) {
  const { addItem, setIsCartOpen } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(() => {
    const defaultOption = product.options?.find(
      (o) => o.priceDeltaMinor === 0 && o.isAvailable !== false
    );
    return defaultOption ? [defaultOption.id] : [];
  });
  const [note, setNote] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const [reviewsList, setReviewsList] = useState<
    Array<{
      id: string;
      rating: number;
      comment?: string | null;
      customerName?: string | null;
      createdAt: string;
    }>
  >([]);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setReviewsList(json.data);
        }
      } catch {
        // quiet fallback
      }
    }
    if (product.id) {
      loadReviews();
    }
  }, [product.id]);

  // Toggle option modifier
  const handleToggleOption = (option: OptionItem) => {
    setSelectedOptionIds((prev) => {
      const prefix = option.name.includes(":")
        ? option.name.split(":")[0].trim()
        : null;

      if (prefix) {
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

      if (prev.includes(option.id)) {
        return prev.filter((id) => id !== option.id);
      }
      return [...prev, option.id];
    });
  };

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
      setIsCartOpen(true);
    }, 400);
  };

  // Group options
  const optionGroups = (product.options || []).reduce<
    Record<string, OptionItem[]>
  >((acc, opt) => {
    const groupName = opt.name.includes(":")
      ? opt.name.split(":")[0].trim()
      : "Pilihan Tambahan / Topping";

    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(opt);
    return acc;
  }, {});

  return (
    <div className="space-y-12">
      {/* Back button */}
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Katalog Menu</span>
      </Link>

      {/* Main 2-Column Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Food Photography */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-card overflow-hidden bg-sand-200 shadow-elevation-2 border border-sand-300">
            <MenuImage
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="p-4 rounded-card bg-sand-50 border border-sand-200 text-xs text-stone-600 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              Dimasak segar saat pesanan masuk. Bebas MSG tambahan dengan bahan-bahan organik lokal.
            </span>
          </div>
        </div>

        {/* Right Column: Customization Controls & Add to Cart */}
        <div className="lg:col-span-6 glass-card bg-white/95 rounded-card p-6 sm:p-8 border border-sand-300 shadow-elevation-2 space-y-6">
          <div>
            {product.categoryName && (
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                {product.categoryName}
              </span>
            )}
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
              {product.name}
            </h1>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl text-stone-900">
                {formatCurrency(unitTotal)}
              </span>
              {optionsTotalDelta > 0 && (
                <span className="text-xs text-stone-500">
                  (Base: {formatCurrency(product.priceMinor)} + Opsi: {formatCurrency(optionsTotalDelta)})
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-stone-600 leading-relaxed border-t border-b border-sand-200 py-3">
              {product.description}
            </p>
          )}

          {/* Option Modifiers */}
          {Object.entries(optionGroups).map(([groupTitle, options]) => (
            <div key={groupTitle} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-primary" />
                  <span>{groupTitle}</span>
                </h3>
                <span className="text-[11px] text-stone-500 font-medium">
                  {options.some((o) => o.name.includes(":"))
                    ? "Pilih 1 opsi"
                    : "Opsional"}
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
                          : "Gratis"}
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
              Instruksi Khusus Dapur
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Pisahkan kuah, sedikit minyak, jangan pakai daun ketumbar..."
              rows={2}
              className="w-full p-3 rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 outline-none resize-none transition-all"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-sand-200 flex items-center gap-4">
            <div className="flex items-center border border-sand-300 rounded-button bg-white shadow-sm overflow-hidden flex-shrink-0">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-stone-600 hover:bg-sand-100 disabled:opacity-40 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-stone-800 min-w-[32px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 text-stone-600 hover:bg-sand-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-5 rounded-button text-white font-semibold text-sm shadow-elevation-1 transition-all flex items-center justify-between ${
                isAdded
                  ? "bg-emerald-600"
                  : "bg-primary hover:bg-primary-hover active:scale-[0.99]"
              }`}
            >
              <div className="flex items-center gap-2">
                {isAdded ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                <span>{isAdded ? "Ditambahkan!" : "Tambah ke Keranjang"}</span>
              </div>
              <span className="font-bold">{formatCurrency(grandTotal)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verified Customer Reviews Section */}
      <div className="space-y-6 pt-6 border-t border-sand-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl text-stone-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Ulasan Pelanggan Terverifikasi</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Apresiasi jujur dari penikmat hidangan autentik Nusantara
            </p>
          </div>
          <span className="text-xs font-bold text-stone-700 bg-sand-200/80 px-3 py-1.5 rounded-full">
            {reviewsList.length > 0
              ? `${(
                  reviewsList.reduce((acc, r) => acc + r.rating, 0) /
                  reviewsList.length
                ).toFixed(1)} / 5.0 (${reviewsList.length} ulasan)`
              : "5.0 / 5.0 (Rating Koki)"}
          </span>
        </div>

        {reviewsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="glass-card bg-white rounded-card p-4 border border-sand-200 shadow-elevation-1 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {rev.customerName?.charAt(0) || "P"}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">
                        {rev.customerName || "Pelanggan Terverifikasi"}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Pembeli Terverifikasi</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-stone-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs text-stone-700 italic bg-sand-50/70 p-2.5 rounded-md">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}

                <span className="text-[10px] text-stone-400 block text-right">
                  {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-card bg-sand-50 border border-sand-200 text-center space-y-1">
            <p className="text-xs font-semibold text-stone-700">
              Belum ada ulasan untuk hidangan ini.
            </p>
            <p className="text-[11px] text-stone-500">
              Pesan dan cicipi hidangan ini untuk membagikan ulasan terverifikasi pertama Anda!
            </p>
          </div>
        )}
      </div>

      {/* Recommended Pairings */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-sand-300">
          <h2 className="font-heading font-bold text-xl text-stone-900">
            Rekomendasi Pendamping Lezat
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/menu/${rel.slug}`}
                className="glass-card bg-white rounded-card overflow-hidden border border-sand-200 hover:border-primary hover:shadow-elevation-2 transition-all p-3 flex items-center gap-3.5 group"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand-200 flex-shrink-0">
                  <MenuImage
                    src={rel.imageUrl}
                    alt={rel.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-xs sm:text-sm text-stone-900 truncate group-hover:text-primary transition-colors">
                    {rel.name}
                  </h3>
                  <p className="text-xs font-bold text-primary mt-1">
                    {formatCurrency(rel.priceMinor)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
