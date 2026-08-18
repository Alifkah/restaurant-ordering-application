import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderTrackerClient from "@/components/orders/OrderTrackerClient";

interface OrderTrackingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Live Order Tracking | Nusantara Artisan Kitchen & Lounge",
  description: "Track your kitchen order status and cooking progress in real-time.",
};

export default async function OrderTrackingPage({
  params,
}: OrderTrackingPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-sand-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1">
        <OrderTrackerClient orderId={id} />
      </main>

      <Footer />
    </div>
  );
}
