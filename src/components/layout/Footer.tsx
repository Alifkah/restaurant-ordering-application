import Link from "next/link";
import { UtensilsCrossed, MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-8 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-elevation-1">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-white leading-tight">
                  Nusantara Artisan
                </h2>
                <p className="text-xs text-amber-500 font-medium tracking-wide uppercase">
                  Kitchen & Lounge
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Cita rasa warisan kuliner kepulauan nusantara yang diolah dengan bahan-bahan lokal pilihan dan teknik woodfired grill kontemporer.
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Jam Operasional (WITA)</span>
            </h3>
            <ul className="text-xs text-stone-400 space-y-1.5">
              <li className="flex justify-between">
                <span>Senin - Kamis:</span>
                <span className="text-stone-200 font-medium">10:00 - 22:00</span>
              </li>
              <li className="flex justify-between">
                <span>Jumat:</span>
                <span className="text-stone-200 font-medium">10:00 - 23:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sabtu:</span>
                <span className="text-stone-200 font-medium">09:00 - 23:00</span>
              </li>
              <li className="flex justify-between">
                <span>Minggu:</span>
                <span className="text-stone-200 font-medium">09:00 - 22:00</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-white">
              Navigasi Cepat
            </h3>
            <ul className="text-xs space-y-2">
              <li>
                <Link href="/menu" className="hover:text-primary transition-colors">
                  Katalog Menu Digital
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Tentang & Kisah Kami
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Akun Pelanggan & Lacak Pesanan
                </Link>
              </li>
              <li>
                <Link href="/kitchen" className="hover:text-primary transition-colors">
                  Kitchen Display Board (Staff)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-white">
              Lokasi & Kontak
            </h3>
            <ul className="text-xs text-stone-400 space-y-2.5">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Jl. Sunset Road No. 88, Seminyak, Bali 80361</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+62 361 8499 123</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>hospitality@nusantara-artisan.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Nusantara Artisan Kitchen & Lounge. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Pembayaran Aman Didukung oleh Stripe SSL 256-Bit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
