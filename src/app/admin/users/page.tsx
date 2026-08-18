import type { Metadata } from "next";
import UsersClient from "@/components/admin/UsersClient";

export const metadata: Metadata = {
  title: "Manage Users & RBAC | Nusantara Admin Suite",
  description: "Role-based access control management for kitchen staff, administrators, and guest accounts.",
};

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return <UsersClient />;
}
