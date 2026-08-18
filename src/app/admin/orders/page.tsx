import type { Metadata } from "next";
import OrdersClient from "@/components/admin/OrdersClient";

export const metadata: Metadata = {
  title: "Master Orders & Queue | Nusantara Admin Suite",
  description: "Comprehensive history of all restaurant guest transactions and KOT kitchen ticket printing.",
};

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return <OrdersClient />;
}
