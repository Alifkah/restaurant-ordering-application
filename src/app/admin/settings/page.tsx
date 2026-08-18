import type { Metadata } from "next";
import SettingsClient from "@/components/admin/SettingsClient";

export const metadata: Metadata = {
  title: "Pengaturan Restoran & Mata Uang | Nusantara Admin Suite",
  description: "Konfigurasi status buka toko, mata uang multi-currency, dan informasi kontak.",
};

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return <SettingsClient />;
}
