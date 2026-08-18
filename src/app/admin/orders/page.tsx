import type { Metadata } from "next";
import OrdersClient from "@/components/admin/OrdersClient";

export const metadata: Metadata = {
  title: "Master Pesanan & Antrean | Nusantara Admin Suite",
  description: "Daftar riwayat seluruh transaksi pesanan restoran dan cetak tiket dapur KOT.",
};

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return <OrdersClient />;
}
