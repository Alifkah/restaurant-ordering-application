import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Keranjang Belanja & Checkout | Nusantara Artisan Kitchen & Lounge",
  description: "Tinjau pesanan hidangan nusantara Anda, tentukan opsi makan di tempat atau bawa pulang, dan lanjutkan ke pembayaran.",
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
