"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesClient() {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (res.ok && json.success) {
        setCategoriesList(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder(categoriesList.length * 10);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || "");
    setSortOrder(c.sortOrder);
    setIsActive(c.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      sortOrder: Number(sortOrder),
      isActive,
    };

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error?.message || "Failed to save category.");
      } else {
        setIsModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      console.error("Save category error:", err);
      setFormError("Network communication error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to deactivate category "${catName}"?`)) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Menu Taxonomy
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Menu Categories
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Organize dish groups, catalog display ordering, and category availability.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-button bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-elevation-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="glass-card bg-white rounded-card border border-sand-300 shadow-elevation-1 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-sand-50 text-stone-600 font-bold uppercase tracking-wider border-b border-sand-200">
            <tr>
              <th className="p-4">Sort Order</th>
              <th className="p-4">Category Name</th>
              <th className="p-4">URL Slug</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                  Loading categories...
                </td>
              </tr>
            ) : categoriesList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-400">
                  No categories configured yet.
                </td>
              </tr>
            ) : (
              categoriesList.map((cat) => (
                <tr key={cat.id} className="hover:bg-sand-50/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-stone-500">
                    {cat.sortOrder}
                  </td>
                  <td className="p-4 font-heading font-bold text-stone-900 text-xs sm:text-sm">
                    {cat.name}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-stone-400">
                    /{cat.slug}
                  </td>
                  <td className="p-4 text-stone-600 max-w-xs truncate">
                    {cat.description || "-"}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        cat.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-stone-100 text-stone-500 border-stone-300"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded bg-sand-100 hover:bg-sand-200 text-stone-700 transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Create & Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-card w-full max-w-md border border-sand-300 shadow-elevation-3 p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <h2 className="font-heading font-bold text-base text-stone-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
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
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Signature Mains"
                  className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="signature-mains"
                  className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Brief Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief culinary narrative for dishes in this section..."
                  className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Active Status
                  </label>
                  <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-sand-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-button bg-sand-100 hover:bg-sand-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-button bg-primary hover:bg-primary-hover text-white shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
