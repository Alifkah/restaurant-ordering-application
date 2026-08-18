"use client";

import { useState } from "react";
import { Star, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  orderId: string;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  orderId,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setError(json.error?.message || "Gagal mengirim ulasan.");
      }
    } catch {
      setError("Terjadi gangguan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card bg-white rounded-card w-full max-w-md border border-sand-300 shadow-elevation-3 p-6 space-y-5 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-sand-200">
          <div>
            <span className="text-[11px] font-bold text-primary uppercase block">
              Ulasan Pelanggan Terverifikasi
            </span>
            <h3 className="font-heading font-bold text-base text-stone-900 truncate">
              {productName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-heading font-bold text-stone-900 text-base">
              Ulasan Berhasil Terkirim!
            </h4>
            <p className="text-xs text-stone-600">
              Terima kasih atas apresiasi dan masukan berharga Anda untuk Koki kami.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating Picker */}
            <div className="text-center py-2 space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Bagaimana Pengalaman Cita Rasa Anda?
              </label>
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? "text-amber-400 fill-amber-400"
                          : "text-stone-300"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-600 block">
                {rating === 5 && "⭐ Sempurna! Sangat Lezat"}
                {rating === 4 && "⭐ Sangat Bagus & Nikmat"}
                {rating === 3 && "⭐ Cukup Baik"}
                {rating === 2 && "⭐ Kurang Memuaskan"}
                {rating === 1 && "⭐ Perlu Peningkatan"}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Komentar / Ulasan Singkat (Opsional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagikan kesan Anda tentang tekstur, rempah, atau aroma hidangan ini..."
                className="w-full p-2.5 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="pt-3 border-t border-sand-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
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
                <span>Kirim Ulasan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
