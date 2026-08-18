import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CancelClient from "@/components/checkout/CancelClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Cancelled | Nusantara Artisan Kitchen & Lounge",
  description: "Your payment was not completed. You can retry checkout anytime.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-sand-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1">
        <Suspense
          fallback={
            <div className="max-w-md mx-auto my-16 p-8 glass-card bg-white rounded-card border border-sand-300 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm font-semibold text-stone-700">
                Loading cancellation status...
              </p>
            </div>
          }
        >
          <CancelClient />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
