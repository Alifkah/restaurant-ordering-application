import type { Metadata } from "next";
import ProductsClient from "@/components/admin/ProductsClient";

export const metadata: Metadata = {
  title: "Kelola Menu & Produk | Nusantara Admin Suite",
  description: "Manajemen katalog menu, harga, ketersediaan, dan varian hidangan.",
};

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return <ProductsClient />;
}
