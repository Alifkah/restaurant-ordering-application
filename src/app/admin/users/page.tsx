import type { Metadata } from "next";
import UsersClient from "@/components/admin/UsersClient";

export const metadata: Metadata = {
  title: "Kelola Pengguna & RBAC | Nusantara Admin Suite",
  description: "Manajemen hak akses role staf dapur, admin, dan akun pelanggan.",
};

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return <UsersClient />;
}
