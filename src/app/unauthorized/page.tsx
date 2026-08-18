import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-sand-100">
      <div className="w-full max-w-md mx-auto text-center glass-card bg-white/95 rounded-card p-8 shadow-elevation-2 border border-sand-300">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="font-heading text-2xl font-bold text-stone-900 mb-2">
          Akses Ditolak (403)
        </h1>

        <p className="text-stone-600 text-sm mb-8 leading-relaxed">
          Anda tidak memiliki izin (peran akses) yang sesuai untuk membuka halaman ini. Silakan kembali atau masuk menggunakan akun dengan hak akses yang berwenang.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-button border border-sand-300 bg-white hover:bg-sand-50 text-stone-700 text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-5 py-2.5 rounded-button bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Ganti Akun</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
