import type { Metadata } from "next";
import AuditLogsClient from "@/components/admin/AuditLogsClient";

export const metadata: Metadata = {
  title: "Audit Trail & Logs | Nusantara Admin Suite",
  description: "Rekaman historis seluruh aktivitas operasional dan perubahan konfigurasi sistem.",
};

export const dynamic = "force-dynamic";

export default function AdminAuditLogsPage() {
  return <AuditLogsClient />;
}
