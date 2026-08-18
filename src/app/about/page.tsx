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
  title: "Kisah Kami (Our Story) | Nusantara Artisan Kitchen & Lounge",
  description: "Menghidupkan kekayaan rempah kepulauan nusantara melalui teknik woodfired grill dan bahan lokal berkualitas tinggi.",
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
              <span>Filosofi & Kisah Kuliner</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Menghidupkan Warisan Rempah Nusantara
            </h1>
            <p className="text-sm sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Sebuah perayaan cita rasa kepulauan Indonesia yang diolah dengan bahan-bahan organik lokal, teknik pemanggangan arang batok kelapa, dan ketelitian rasa kontemporer.
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
                Harmoni Bumbu Asli & Kayu Bakar
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Di Nusantara Artisan Kitchen, kami meyakini bahwa hidangan terbaik berakar pada kejujuran bahan baku. Dari kecombrang segar dataran tinggi Bedugul, lada hitam Lampung, hingga kelapa bakar Bali, setiap rempah ditumbuk dan diracik secara tradisional demi mempertahankan intensitas aromatiknya.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Rendang Wagyu kami dimasak perlahan selama 12 jam pada temperatur rendah dengan santan caramelised pekat, menghasilkan kelembutan tekstur daging yang lumer di mulut.
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
                Pemanggangan di atas arang kayu kelapa murni memberikan kedalaman aroma smoky yang gurih dan renyah di luar namun juicy di dalam.
              </p>
            </div>

            <div className="glass-card bg-white p-6 rounded-card border border-sand-300 shadow-elevation-1">
              <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
                Farm-to-Table Organik
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Bermitra langsung dengan petani sayur lokal Bali dan nelayan tangkap ramah lingkungan untuk menjamin kesegaran bahan harian.
              </p>
            </div>

            <div className="glass-card bg-white p-6 rounded-card border border-sand-300 shadow-elevation-1">
              <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
                Tanpa Pengawet & MSG
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Semua kaldu, minyak bawang, dan sambal diproduksi in-house tanpa penguat rasa artifisial maupun bahan pengawet.
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
                Kunjungi Kami
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Lokasi & Jam Operasional
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5">
                Suasana lounge yang teduh di jantung kawasan Seminyak, siap menyambut santap siang dan makan malam Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-800">
              <div className="p-4 rounded-card bg-sand-50 border border-sand-200 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Alamat Restoran</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Jl. Sunset Road No. 88, Seminyak, Kuta, Kabupaten Badung, Bali 80361
                </p>
              </div>

              <div className="p-4 rounded-card bg-sand-50 border border-sand-200 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Jam Buka (WITA)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Senin - Kamis: 10:00 - 22:00<br />
                  Jumat - Sabtu: 10:00 - 23:00<br />
                  Minggu: 09:00 - 22:00
                </p>
              </div>

              <div className="p-4 rounded-card bg-sand-50 border border-sand-200 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Phone className="w-4 h-4" />
                  <span>Kontak & Reservasi</span>
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
                <span>Lihat Menu & Mulai Pesan Online</span>
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
