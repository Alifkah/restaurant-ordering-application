import type { Metadata } from "next";
import CategoriesClient from "@/components/admin/CategoriesClient";

export const metadata: Metadata = {
  title: "Kelola Kategori Menu | Nusantara Admin Suite",
  description: "Manajemen taksonomi dan urutan kategori menu makanan.",
};

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  return <CategoriesClient />;
}
