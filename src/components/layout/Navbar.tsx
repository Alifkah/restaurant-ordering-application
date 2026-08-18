"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import {
  UtensilsCrossed,
  User,
  Shield,
  ChefHat,
  LogOut,
  LogIn,
  ShoppingBag,
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { totalItems, setIsCartOpen } = useCart();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 glass-nav px-4 sm:px-6 py-3 border-b border-sand-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-elevation-1 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-bold text-base sm:text-lg text-stone-900 leading-tight block">
              Nusantara Artisan
            </span>
            <span className="text-[10px] sm:text-xs text-primary font-medium tracking-wide uppercase block">
              Kitchen & Lounge
            </span>
          </div>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-stone-700">
          <Link
            href="/menu"
            className="hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span>Menu Catalog</span>
          </Link>
          <Link
            href="/about"
            className="hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span>Our Story</span>
          </Link>
          <Link
            href="/about#location"
            className="hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span>Location & Hours</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Restaurant Status (Pill) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Open • Until 10:00 PM WITA</span>
          </div>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Dining Basket"
            className="relative p-2 rounded-button bg-sand-200/80 hover:bg-sand-300 text-stone-800 transition-colors flex items-center justify-center"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          {/* Admin / Kitchen shortcuts */}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden sm:flex px-2.5 py-1.5 rounded-button bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors items-center gap-1.5 shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </Link>
          )}

          {user?.role === "staff" && (
            <Link
              href="/kitchen"
              className="hidden sm:flex px-2.5 py-1.5 rounded-button bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors items-center gap-1.5 shadow-sm"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen</span>
            </Link>
          )}

          {/* Auth State */}
          {status === "loading" ? (
            <div className="w-20 h-8 bg-sand-200 animate-pulse rounded-button" />
          ) : user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-sand-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-stone-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-stone-500 font-medium capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign Out"
                className="p-1.5 rounded-button text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-button bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-hover shadow-elevation-1 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
