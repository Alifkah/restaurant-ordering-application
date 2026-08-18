import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Dining Basket & Checkout | Nusantara Artisan Kitchen & Lounge",
  description: "Review your selected archipelago dishes, choose dine-in or takeaway, and proceed to secure checkout.",
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-sand-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1">
        <CartPageClient />
      </main>

      <Footer />
    </div>
  );
}
