import type { Metadata } from "next";
import DashboardClient from "@/components/admin/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard & KPI | Nusantara Admin Suite",
  description: "Executive control panel and realtime operational metrics.",
};

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return <DashboardClient />;
}
