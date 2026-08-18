"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import MenuImage from "@/components/ui/MenuImage";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ProductOption {
  id?: string;
  name: string;
  description?: string | null;
  priceDeltaMinor: number;
  isAvailable: boolean;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  priceMinor: number;
  currency: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  isAvailable: boolean;
  sortOrder: number;
  options?: ProductOption[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsClient() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [priceMinor, setPriceMinor] = useState<number>(50000);
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [options, setOptions] = useState<ProductOption[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      const [prodJson, catJson] = await Promise.all([prodRes.json(), catRes.json()]);

      if (prodRes.ok && prodJson.success) setProductsList(prodJson.data);
      if (catRes.ok && catJson.success) setCategoriesList(catJson.data);
    } catch (err) {
      console.warn("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setCategoryId(categoriesList[0]?.id || "");
    setName("");
    setSlug("");
    setDescription("");
    setPriceMinor(50000);
    setImageUrl("");
    setIsAvailable(true);
    setOptions([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setCategoryId(p.categoryId);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description || "");
    setPriceMinor(p.priceMinor);
    setImageUrl(p.imageUrl || "");
    setIsAvailable(p.isAvailable);
    setOptions(p.options || []);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProduct) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  // Option Builder Helpers
  const addOption = () => {
    setOptions([
      ...options,
      { name: "Opsi Baru", priceDeltaMinor: 0, isAvailable: true },
    ]);
  };

  const updateOption = (index: number, updated: Partial<ProductOption>) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, ...updated } : opt))
    );
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle Instant Availability
  const toggleAvailability = async (p: Product) => {
    const nextStatus = !p.isAvailable;
    setProductsList((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, isAvailable: nextStatus } : item))
    );

    try {
      await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextStatus }),
      });
    } catch {
      fetchData(); // Rollback
    }
  };

  // Submit Product Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = {
      categoryId,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      priceMinor: Number(priceMinor),
      currency: "IDR",
      imageUrl: imageUrl.trim() || null,
      isAvailable,
      options,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setFormError(json.error?.message || "Gagal menyimpan data produk.");
      } else {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error("Save product error:", err);
      setFormError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan hidangan "${prodName}"?`)) return;

    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Delete product error:", err);
    }
  };

  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Menu Engineering
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Katalog Menu & Hidangan
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Kelola daftar masakan nusantara, varian kustomisasi koki, dan ketersediaan harian.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-button bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-elevation-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card bg-white p-4 rounded-card border border-sand-300 shadow-elevation-1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari hidangan berdasarkan nama..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-button bg-sand-50/60 border border-sand-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 text-xs rounded-button bg-sand-50/60 border border-sand-300 focus:border-primary outline-none transition-all"
          >
            <option value="all">Semua Kategori</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-stone-500">
          Total {filteredProducts.length} Hidangan
        </span>
      </div>

      {/* Products Data Table */}
      <div className="glass-card bg-white rounded-card border border-sand-300 shadow-elevation-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-stone-600 font-bold uppercase tracking-wider border-b border-sand-200">
              <tr>
                <th className="p-4">Foto</th>
                <th className="p-4">Nama Hidangan</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga Pokok</th>
                <th className="p-4">Varian Opsi</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    Memuat katalog produk...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    Tidak ada hidangan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const cat = categoriesList.find((c) => c.id === prod.categoryId);

                  return (
                    <tr key={prod.id} className="hover:bg-sand-50/60 transition-colors">
                      <td className="p-4">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-sand-200 flex-shrink-0 border border-sand-300">
                          <MenuImage
                            src={prod.imageUrl}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-heading font-bold text-stone-900 text-xs sm:text-sm block">
                          {prod.name}
                        </span>
                        <span className="font-mono text-[11px] text-stone-400">
                          /{prod.slug}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sand-100 text-stone-700 border border-sand-200">
                          {cat?.name || "Kategori"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-stone-900">
                        {formatCurrency(prod.priceMinor)}
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] font-medium text-stone-600">
                          {prod.options?.length || 0} modifier
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleAvailability(prod)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            prod.isAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                          }`}
                        >
                          {prod.isAvailable ? "Tersedia" : "Habis"}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded bg-sand-100 hover:bg-sand-200 text-stone-700 transition-colors"
                            title="Edit Hidangan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Nonaktifkan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Drawer Create & Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-sand-300 shadow-elevation-3 p-6 sm:p-8 space-y-6 animate-scale-up custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <h2 className="font-heading font-bold text-lg text-stone-900">
                {editingProduct ? "Edit Hidangan" : "Tambah Hidangan Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nama Hidangan *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: Rendang Wagyu 12 Jam"
                    className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Slug URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="rendang-wagyu-12-jam"
                    className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Harga Pokok (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceMinor}
                    onChange={(e) => setPriceMinor(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Deskripsi Hidangan
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan racikan rempah dan tekstur hidangan ini..."
                  className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  URL Foto Produk (Cloudinary / WebP)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none"
                />
              </div>

              {/* Dynamic Modifier Options Builder */}
              <div className="pt-3 border-t border-sand-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-stone-800">
                      Opsi / Varian Kustomisasi ({options.length})
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Tingkat pedas, jenis mie, sambal, atau topping ekstra
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-2.5 py-1 rounded bg-sand-100 hover:bg-sand-200 text-stone-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Opsi</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-card bg-sand-50/80 border border-sand-200 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => updateOption(idx, { name: e.target.value })}
                        placeholder="Nama opsi (misal: Ekstra Sambal)"
                        className="flex-1 p-2 text-xs rounded bg-white border border-sand-300 outline-none"
                      />
                      <input
                        type="number"
                        value={opt.priceDeltaMinor}
                        onChange={(e) =>
                          updateOption(idx, { priceDeltaMinor: Number(e.target.value) })
                        }
                        placeholder="+Harga"
                        className="w-24 p-2 text-xs rounded bg-white border border-sand-300 outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-sand-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-button bg-sand-100 hover:bg-sand-200 text-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-button bg-primary hover:bg-primary-hover text-white shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? "Simpan Perubahan" : "Buat Hidangan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
