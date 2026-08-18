import type { Metadata } from "next";
import SettingsClient from "@/components/admin/SettingsClient";

export const metadata: Metadata = {
  title: "Restaurant Settings & Currency | Nusantara Admin Suite",
  description: "Configure store operational status, multi-currency settings, and contact information.",
};

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return <SettingsClient />;
}
