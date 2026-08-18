import type { Metadata } from "next";
import ProductsClient from "@/components/admin/ProductsClient";

export const metadata: Metadata = {
  title: "Manage Menu & Dishes | Nusantara Admin Suite",
  description: "Culinary catalog management, prices, stock availability, and dish modifiers.",
};

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return <ProductsClient />;
}
