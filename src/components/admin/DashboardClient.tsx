"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  ChefHat,
  Clock,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface ReportData {
  totalRevenueMinor: number;
  totalOrders: number;
  completedOrders: number;
  averageTicketMinor: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalMinor: number;
    currency: string;
    customerNote?: string | null;
    createdAt: string;
  }>;
  topSelling: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

export default function DashboardClient() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const completionRate =
    data && data.totalOrders > 0
      ? Math.round((data.completedOrders / data.totalOrders) * 100)
      : 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Executive Control
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Dashboard & Analitik Restoran
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Pantau kinerja finansial, antrean dapur, dan penjualan menu secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchReports}
            className="px-3 py-2 rounded-button bg-white border border-sand-300 hover:bg-sand-50 text-stone-700 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Perbarui Data</span>
          </button>

          <Link
            href="/kitchen"
            target="_blank"
            className="px-4 py-2 rounded-button bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-elevation-1 transition-all flex items-center gap-1.5"
          >
            <ChefHat className="w-4 h-4" />
            <span>Buka Kitchen KDS</span>
          </Link>
        </div>
      </div>

      {/* 1. KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Gross Revenue */}
        <div className="glass-card bg-white p-5 rounded-card border border-sand-300 shadow-elevation-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Omset (Gross)
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900">
              {formatCurrency(data?.totalRevenueMinor || 0)}
            </h2>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Pendapatan dari pesanan valid</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="glass-card bg-white p-5 rounded-card border border-sand-300 shadow-elevation-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Pesanan
            </span>
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900">
              {data?.totalOrders || 0} Tiket
            </h2>
            <p className="text-[11px] text-stone-500 mt-1">
              {data?.completedOrders || 0} telah selesai disajikan
            </p>
          </div>
        </div>

        {/* Card 3: Average Ticket */}
        <div className="glass-card bg-white p-5 rounded-card border border-sand-300 shadow-elevation-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Rata-rata Tiket (AOV)
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900">
              {formatCurrency(data?.averageTicketMinor || 0)}
            </h2>
            <p className="text-[11px] text-stone-500 mt-1">
              Nilai per transaksi pelanggan
            </p>
          </div>
        </div>

        {/* Card 4: Fulfillment Rate */}
        <div className="glass-card bg-white p-5 rounded-card border border-sand-300 shadow-elevation-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Fulfillment Rate
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900">
              {completionRate}%
            </h2>
            <p className="text-[11px] text-stone-500 mt-1">
              Tingkat penyelesaian pesanan dapur
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content Split: Recent Orders & Top Selling Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Live Orders Table */}
        <div className="lg:col-span-8 glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <div>
              <h3 className="font-heading font-bold text-base text-stone-900">
                Pesanan Masuk Terbaru
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Aliran transaksi pelanggan dan status langsung dari dapur
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <span>Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-stone-600 font-bold uppercase tracking-wider border-b border-sand-200">
                <tr>
                  <th className="p-3">No. Order</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {data?.recentOrders && data.recentOrders.length > 0 ? (
                  data.recentOrders.map((ord) => {
                    let statusBadge = "bg-amber-100 text-amber-800";
                    if (ord.status === "confirmed") statusBadge = "bg-blue-100 text-blue-800";
                    if (ord.status === "preparing") statusBadge = "bg-orange-100 text-orange-800";
                    if (ord.status === "ready") statusBadge = "bg-emerald-100 text-emerald-800";
                    if (ord.status === "completed") statusBadge = "bg-stone-100 text-stone-700";

                    return (
                      <tr key={ord.id} className="hover:bg-sand-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-stone-900">
                          {ord.orderNumber}
                        </td>
                        <td className="p-3 text-stone-500">
                          {new Date(ord.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${statusBadge}`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-stone-900 text-right">
                          {formatCurrency(ord.totalMinor)}
                        </td>
                        <td className="p-3 text-center">
                          <Link
                            href={`/orders/${ord.id}`}
                            target="_blank"
                            className="text-stone-400 hover:text-primary p-1 inline-block"
                            title="Buka Pelacak Pesanan"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-400">
                      Belum ada transaksi tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top Selling Leaderboard */}
        <div className="lg:col-span-4 glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-1 space-y-4">
          <div className="pb-3 border-b border-sand-200">
            <h3 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              <span>Menu Terlaris</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              5 Hidangan paling diminati pelanggan
            </p>
          </div>

          <div className="space-y-3">
            {data?.topSelling && data.topSelling.length > 0 ? (
              data.topSelling.map((prod, idx) => (
                <div
                  key={prod.id || idx}
                  className="p-3 rounded-card bg-sand-50/70 border border-sand-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                      {prod.name}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-primary px-2.5 py-1 rounded bg-primary/10 border border-primary/20 flex-shrink-0">
                    {prod.quantity} porsi
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 italic py-6 text-center">
                Belum ada data penjualan.
              </p>
            )}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/products"
              className="w-full py-2.5 rounded-button bg-sand-100 hover:bg-sand-200 text-stone-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Kelola Katalog Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
