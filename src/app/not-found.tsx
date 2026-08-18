import Link from "next/link";
import { UtensilsCrossed, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sand-100 flex flex-col justify-center items-center px-4 text-center">
      <div className="max-w-md w-full glass-card bg-white rounded-card p-8 sm:p-10 border border-sand-300 shadow-elevation-2 space-y-6 animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
          <UtensilsCrossed className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
            404 NOT FOUND
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-stone-900">
            Resep Hidangan Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Halaman atau menu yang Anda tuju mungkin telah dipindahkan atau belum tersedia di buku menu kami.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/menu"
            className="flex-1 py-3 px-4 rounded-button bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors shadow-elevation-1 flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Jelajahi Menu</span>
          </Link>
          <Link
            href="/"
            className="py-3 px-4 rounded-button bg-sand-100 hover:bg-sand-200 text-stone-800 font-semibold text-xs border border-sand-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
