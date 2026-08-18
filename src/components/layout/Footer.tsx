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
              Heritage culinary flavors of the Indonesian archipelago crafted with locally sourced farm ingredients and contemporary woodfired techniques.
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Service Hours (WITA)</span>
            </h3>
            <ul className="text-xs text-stone-400 space-y-1.5">
              <li className="flex justify-between">
                <span>Monday - Thursday:</span>
                <span className="text-stone-200 font-medium">10:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Friday:</span>
                <span className="text-stone-200 font-medium">10:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-stone-200 font-medium">09:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-stone-200 font-medium">09:00 AM - 10:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-white">
              Quick Navigation
            </h3>
            <ul className="text-xs space-y-2">
              <li>
                <Link href="/menu" className="hover:text-primary transition-colors">
                  Digital Menu Catalog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About & Culinary Story
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Guest Account & Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/kitchen" className="hover:text-primary transition-colors">
                  Kitchen Display Board (KDS)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-white">
              Location & Inquiries
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
            <span>Secure 256-Bit SSL Checkout powered by Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
