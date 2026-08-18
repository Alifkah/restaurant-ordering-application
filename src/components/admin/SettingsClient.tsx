"use client";

import { useState, useEffect } from "react";
import {
  Store,
  DollarSign,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface RestaurantConfig {
  id?: string;
  restaurantName: string;
  isAcceptingOrders: boolean;
  currency: string;
  currencySymbol: string;
  currencyDecimals: number;
  timezone: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
}

const CURRENCY_PRESETS = [
  { code: "IDR", symbol: "Rp", decimals: 0, label: "Indonesian Rupiah (IDR - Rp)" },
  { code: "USD", symbol: "$", decimals: 2, label: "US Dollar (USD - $)" },
  { code: "EUR", symbol: "€", decimals: 2, label: "Euro (EUR - €)" },
  { code: "SGD", symbol: "S$", decimals: 2, label: "Singapore Dollar (SGD - S$)" },
];

export default function SettingsClient() {
  const [config, setConfig] = useState<RestaurantConfig>({
    restaurantName: "Nusantara Artisan Kitchen & Lounge",
    isAcceptingOrders: true,
    currency: "IDR",
    currencySymbol: "Rp",
    currencyDecimals: 0,
    timezone: "Asia/Makassar",
    contactEmail: "hospitality@nusantara-artisan.com",
    contactPhone: "+62 361 8499 123",
    address: "Jl. Sunset Road No. 88, Seminyak, Badung, Bali 80361",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setConfig(json.data);
        }
      } catch (err) {
        console.warn("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleCurrencyChange = (code: string) => {
    const preset = CURRENCY_PRESETS.find((p) => p.code === code);
    if (preset) {
      setConfig((prev) => ({
        ...prev,
        currency: preset.code,
        currencySymbol: preset.symbol,
        currencyDecimals: preset.decimals,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setFeedback({
          type: "success",
          message: "Restaurant and currency configuration saved successfully!",
        });
      } else {
        setFeedback({
          type: "error",
          message: json.error?.message || "Failed to save configuration.",
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network communication error." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 glass-card bg-white rounded-card text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-xs text-stone-600">Loading restaurant settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      {/* Top Header */}
      <div>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          System Configuration
        </span>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
          Restaurant Settings & Currency
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
          Configure store operational status, multi-currency Stripe rules, operating timezone, and contact details.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-card text-xs sm:text-sm flex items-center gap-3 animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
              : "bg-red-50 border border-red-300 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Open/Close Master Switch */}
        <div className="glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-sm sm:text-base text-stone-900">
                  Online Ordering Reception
                </h2>
                <p className="text-xs text-stone-500">
                  Master switch to accept or temporarily pause new incoming orders from the public website.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  isAcceptingOrders: !prev.isAcceptingOrders,
                }))
              }
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                config.isAcceptingOrders
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                  : "bg-stone-200 text-stone-600 border-stone-300"
              }`}
            >
              {config.isAcceptingOrders ? "🟢 Accepting Orders" : "🔴 Temporarily Closed"}
            </button>
          </div>
        </div>

        {/* Section 2: Multi-Currency Rules for Stripe & Display */}
        <div className="glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-1 space-y-4">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm text-stone-900">
                Currency & Payment Settings
              </h2>
              <p className="text-xs text-stone-500">
                The application automatically adjusts zero-decimal vs standard subunit Stripe calculation rules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Active Currency *
              </label>
              <select
                value={config.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none"
              >
                {CURRENCY_PRESETS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={config.currencySymbol}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, currencySymbol: e.target.value }))
                }
                className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Minor Subunit Decimals
              </label>
              <input
                type="number"
                value={config.currencyDecimals}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    currencyDecimals: Number(e.target.value),
                  }))
                }
                className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Identity & Location Details */}
        <div className="glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-1 space-y-4">
          <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm text-stone-900">
                Restaurant Profile & Hospitality Contacts
              </h2>
              <p className="text-xs text-stone-500">
                Public business details rendered across digital receipts, invoices, and customer footers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={config.restaurantName}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, restaurantName: e.target.value }))
                }
                className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Operating Timezone
              </label>
              <input
                type="text"
                value={config.timezone}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, timezone: e.target.value }))
                }
                className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Guest Services Email
              </label>
              <input
                type="email"
                value={config.contactEmail || ""}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, contactEmail: e.target.value }))
                }
                className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Telephone / WhatsApp Line
              </label>
              <input
                type="text"
                value={config.contactPhone || ""}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, contactPhone: e.target.value }))
                }
                className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Outlet Physical Address
            </label>
            <textarea
              rows={2}
              value={config.address || ""}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none resize-none"
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-button bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-elevation-1 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
