import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCartPill from "@/components/cart/FloatingCartPill";
import CartDrawer from "@/components/cart/CartDrawer";
import MenuImage from "@/components/ui/MenuImage";
import {
  Flame,
  Leaf,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story | Nusantara Artisan Kitchen & Lounge",
  description: "Revitalizing the rich spice heritage of the Indonesian archipelago through contemporary woodfired culinary mastery and organic farm ingredients.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-sand-100">
      <Navbar />

      <main className="w-full flex-1">
        {/* About Hero Banner */}
        <section className="relative bg-stone-900 text-white py-16 sm:py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <MenuImage
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=80"
              alt="Kitchen Background"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-stone-900/60" />

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-amber-400 border border-primary/30 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Philosophy & Culinary Heritage</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Revitalizing the Spice Routes of Nusantara
            </h1>
            <p className="text-sm sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              A celebration of archipelago flavors crafted with locally sourced organic produce, coconut charcoal woodfire grilling, and contemporary culinary precision.
            </p>
          </div>
        </section>

        {/* Narrative & Craftsmanship */}
        <section className="max-w-5xl mx-auto px-6 py-14 sm:py-20 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Our Culinary Roots
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
                Harmony of Native Spices & Live Fire
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                At Nusantara Artisan Kitchen, we believe exceptional dining begins with the integrity of raw ingredients. From fresh highland Bedugul torch ginger, Lampung black peppercorns, to Balinese smoked coconut, each spice is ground and blended in-house to preserve intense aromatic vitality.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Our Wagyu Rendang is slow-simmered for 12 hours over gentle heat with rich caramelized coconut milk reduction, yielding a melt-in-the-mouth tenderness and complex umami depth.
              </p>
            </div>

            <div className="relative aspect-[4/3] rounded-card overflow-hidden shadow-elevation-2 border border-sand-300">
              <MenuImage
                src="https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80"
                alt="Artisan Indonesian Cuisine"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            <div className="glass-card bg-white p-6 rounded-card border border-sand-300 shadow-elevation-1">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
                Woodfired Mastery
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Live grilling over dense coconut shell charcoal imparts a distinct smoky aroma, crisp caramelized exterior, and succulent tenderness.
              </p>
            </div>

            <div className="glass-card bg-white p-6 rounded-card border border-sand-300 shadow-elevation-1">
              <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
                Organic Farm-to-Table
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Direct partnerships with local Bali smallholder farmers and sustainable fisheries ensure peak freshness harvested daily.
              </p>
            </div>

            <div className="glass-card bg-white p-6 rounded-card border border-sand-300 shadow-elevation-1">
              <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
                Zero MSG & Preservatives
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                All broths, infused shallot oils, and artisanal sambal relishes are created from scratch without artificial flavor enhancers or preservatives.
              </p>
            </div>
          </div>

          {/* Location & Hours Anchor Card */}
          <div
            id="location"
            className="glass-card bg-white rounded-card p-6 sm:p-10 border border-sand-300 shadow-elevation-2 scroll-mt-24"
          >
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Visit Us
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Location & Service Hours
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5">
                A serene dining sanctuary in the heart of Seminyak, welcoming you for leisurely lunches and evening gatherings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-800">
              <div className="p-4 rounded-card bg-sand-50 border border-sand-200 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Restaurant Address</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Jl. Sunset Road No. 88, Seminyak, Kuta, Badung Regency, Bali 80361
                </p>
              </div>

              <div className="p-4 rounded-card bg-sand-50 border border-sand-200 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Hours (WITA)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Monday - Thursday: 10:00 AM - 10:00 PM<br />
                  Friday - Saturday: 10:00 AM - 11:00 PM<br />
                  Sunday: 09:00 AM - 10:00 PM
                </p>
              </div>

              <div className="p-4 rounded-card bg-sand-50 border border-sand-200 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Phone className="w-4 h-4" />
                  <span>Inquiries & Reservations</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  WhatsApp: +62 361 8499 123<br />
                  Email: hospitality@nusantara-artisan.com
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/menu"
                className="px-6 py-3 rounded-button bg-primary text-white font-semibold text-xs sm:text-sm shadow-elevation-1 hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
              >
                <span>View Menu & Order Online</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FloatingCartPill />
      <CartDrawer />
      <Footer />
    </div>
  );
}
