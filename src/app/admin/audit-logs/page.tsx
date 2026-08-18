import type { Metadata } from "next";
import AuditLogsClient from "@/components/admin/AuditLogsClient";

export const metadata: Metadata = {
  title: "Audit Trail & Logs | Nusantara Admin Suite",
  description: "Historical audit logs of operational activities and system configuration changes.",
};

export const dynamic = "force-dynamic";

export default function AdminAuditLogsPage() {
  return <AuditLogsClient />;
}
