import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SuccessClient from "@/components/checkout/SuccessClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Pembayaran Berhasil | Nusantara Artisan Kitchen & Lounge",
  description: "Terima kasih atas pesanan Anda. Pembayaran telah berhasil dikonfirmasi.",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-sand-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1">
        <Suspense
          fallback={
            <div className="max-w-md mx-auto my-16 p-8 glass-card bg-white rounded-card border border-sand-300 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm font-semibold text-stone-700">
                Memuat konfirmasi pesanan...
              </p>
            </div>
          }
        >
          <SuccessClient />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
