import type { Metadata } from "next";
import CategoriesClient from "@/components/admin/CategoriesClient";

export const metadata: Metadata = {
  title: "Manage Categories | Nusantara Admin Suite",
  description: "Taxonomy management and catalog display order for menu categories.",
};

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  return <CategoriesClient />;
}
