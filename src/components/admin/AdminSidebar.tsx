"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  ShoppingBag,
  Users,
  Settings,
  FileText,
  ChefHat,
  ExternalLink,
  LogOut,
  Shield,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: "/admin", label: "Dashboard & KPI", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Menu & Produk", icon: UtensilsCrossed },
    { href: "/admin/categories", label: "Kategori Menu", icon: Tags },
    { href: "/admin/orders", label: "Master Pesanan", icon: ShoppingBag },
    { href: "/admin/users", label: "Pengguna & RBAC", icon: Users },
    { href: "/admin/settings", label: "Pengaturan Resto", icon: Settings },
    { href: "/admin/audit-logs", label: "Audit Trail", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-200 flex flex-col justify-between border-r border-stone-800 flex-shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading font-extrabold text-sm text-white tracking-tight truncate">
              Nusantara Suite
            </h1>
            <p className="text-[11px] text-stone-400 font-medium truncate">
              Executive Admin Control
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-button text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/70"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Shortcuts */}
      <div className="p-4 border-t border-stone-800 space-y-3">
        {/* User Card */}
        <div className="p-3 rounded-button bg-stone-800/80 border border-stone-700/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/30 text-amber-400 border border-primary/40 font-bold text-xs flex items-center justify-center flex-shrink-0">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {session?.user?.name || "Administrator"}
            </p>
            <p className="text-[10px] text-stone-400 font-mono truncate">
              Role: {session?.user?.role || "admin"}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            href="/kitchen"
            target="_blank"
            className="p-2 rounded-button bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center gap-1.5 font-medium"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-400" />
            <span>KDS</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-button bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center gap-1.5 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
            <span>Store</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-2 px-3 rounded-button bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi Admin</span>
        </button>
      </div>
    </aside>
  );
}
