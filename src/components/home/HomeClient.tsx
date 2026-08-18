"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/menu/ProductCard";
import CustomizationModal, { CustomizationProduct } from "@/components/menu/CustomizationModal";
import MenuImage from "@/components/ui/MenuImage";
import {
  ArrowRight,
  Clock,
  MapPin,
  CreditCard,
  ChefHat,
  Star,
  UtensilsCrossed,
} from "lucide-react";

interface HomeClientProps {
  recommendedProducts: CustomizationProduct[];
}

export default function HomeClient({ recommendedProducts }: HomeClientProps) {
  const [customizingProduct, setCustomizingProduct] = useState<CustomizationProduct | null>(null);

  const categoriesPreview = [
    {
      name: "Signature Mains",
      slug: "signature-mains",
      icon: "🍲",
      desc: "12-Hour Wagyu Rendang & Balinese Betutu Duck",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Artisan Rice & Noodles",
      slug: "artisan-rice-noodles",
      icon: "🍜",
      desc: "Torch Ginger Fragrant Rice & Truffle Bakmi",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Woodfired & Grill",
      slug: "woodfired-grill",
      icon: "🔥",
      desc: "Jimbaran Honey Spiced Grilled Barramundi",
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Specialty Beverages",
      slug: "specialty-beverages",
      icon: "☕",
      desc: "Pandan Palm Sugar Latte & Herbal Elixirs",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Maya Wijaya",
      role: "Verified Food Critic",
      comment: "The 12-Hour Wagyu Rendang is unbelievably tender! The caramelized coconut spice reduction is rich, velvety, and deeply aromatic.",
      rating: 5,
      dish: "12-Hour Wagyu Rendang",
    },
    {
      name: "David Kurniawan",
      role: "Diner from Seminyak",
      comment: "The Balinese Betutu Roasted Duck infused with bumbu genep is roasted to perfection. The digital ordering and kitchen updates are seamless!",
      rating: 5,
      dish: "Roasted Betutu Duck",
    },
    {
      name: "Sarah Jenkins",
      role: "Bali Culinary Guide",
      comment: "The Truffle Mushroom Bakmi paired with Pandan Palm Sugar Latte is my weekly comfort dining experience. World-class Indonesian cuisine!",
      rating: 5,
      dish: "Truffle Chicken & Mushroom Bakmi",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <section className="relative rounded-card sm:rounded-[24px] overflow-hidden bg-stone-900 text-white min-h-[480px] sm:min-h-[540px] flex items-center shadow-elevation-3 border border-sand-300/20">
        <div className="absolute inset-0 opacity-30">
          <MenuImage
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=80"
            alt="Hero Culinary"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/80 to-transparent" />

        <div className="relative z-10 max-w-2xl p-6 sm:p-12 lg:p-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Accepting Online Orders • Open until 10:00 PM WITA</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Artisan Flavors Delivered to Your Table
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
            Heritage spices of the Indonesian archipelago prepared with farm-fresh organic produce and authentic coconut husk woodfire techniques.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/menu"
              className="px-6 py-3.5 rounded-button bg-primary hover:bg-primary-hover text-white font-semibold text-xs sm:text-sm shadow-elevation-1 transition-all flex items-center gap-2 active:scale-95"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Explore Digital Menu</span>
            </Link>

            <Link
              href="/login"
              className="px-5 py-3.5 rounded-button bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <span>Track My Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Quick Info 3-Column Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card bg-white p-5 rounded-card border border-sand-300 shadow-elevation-1 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-stone-900">
              Operating Hours
            </h3>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              Open Daily: 10:00 AM - 10:00 PM WITA (Fri & Sat until 11:00 PM)
            </p>
          </div>
        </div>

        <div className="glass-card bg-white p-5 rounded-card border border-sand-300 shadow-elevation-1 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-stone-900">
              Dining Location
            </h3>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              Jl. Sunset Road No. 88, Seminyak, Bali 80361
            </p>
          </div>
        </div>

        <div className="glass-card bg-white p-5 rounded-card border border-sand-300 shadow-elevation-1 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-stone-900">
              Secure Payments
            </h3>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              Credit/Debit Cards, Apple Pay, Google Pay, and QRIS enabled
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories Showcase */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Culinary Categories
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Flavors of the Archipelago
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categoriesPreview.map((cat) => (
            <Link
              key={cat.slug}
              href={`/menu?category=${cat.slug}`}
              className="group glass-card bg-white rounded-card overflow-hidden border border-sand-300 shadow-elevation-1 hover:shadow-elevation-2 hover:border-primary transition-all p-4 flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-sand-200 mb-3">
                <MenuImage
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-stone-900 group-hover:text-primary transition-colors flex items-center gap-2">
                  <span>{cat.name}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Chef Recommendations Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <ChefHat className="w-4 h-4" />
              <span>Chef&apos;s Recommendations</span>
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Most Celebrated Dishes
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onCustomize={(p) => setCustomizingProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 5. Customer Testimonials Ribbon */}
      <section className="glass-card bg-white rounded-card p-6 sm:p-10 border border-sand-300 shadow-elevation-1 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Verified Reviews
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900">
            What Our Diners Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-5 rounded-card bg-sand-50/70 border border-sand-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-sand-200">
                <p className="text-xs font-bold text-stone-900">{t.name}</p>
                <p className="text-[11px] text-primary font-medium">{t.dish}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customization Modal */}
      <CustomizationModal
        product={customizingProduct}
        isOpen={!!customizingProduct}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
