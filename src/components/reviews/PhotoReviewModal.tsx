"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Star,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Trash2,
  UploadCloud,
  Sparkles,
} from "lucide-react";

export interface PhotoReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  orderId: string;
  onSuccess?: () => void;
}

interface UploadedImage {
  url: string;
  publicId?: string;
  name: string;
}

export default function PhotoReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  orderId,
  onSuccess,
}: PhotoReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo Upload (Cloudinary Signed Upload or Direct)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 3) {
      setError("You can upload a maximum of 3 photos per review.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // 1. Get Signature from backend
      const signRes = await fetch("/api/media/sign", { method: "POST" });
      const signData = await signRes.json();

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files (JPG, PNG, WebP) are allowed.");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("Each photo must be smaller than 5MB.");
          continue;
        }

        // Upload to Cloudinary
        if (signRes.ok && signData.success && signData.data?.apiKey && signData.data?.apiKey !== "123456789") {
          const { signature, timestamp, apiKey, cloudName, folder } = signData.data;
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp.toString());
          formData.append("signature", signature);
          formData.append("folder", folder);

          const cRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
          const cJson = await cRes.json();

          if (cRes.ok && cJson.secure_url) {
            setImages((prev) => [
              ...prev,
              {
                url: cJson.secure_url,
                publicId: cJson.public_id,
                name: file.name,
              },
            ]);
          } else {
            // Fallback object URL if mock
            const previewUrl = URL.createObjectURL(file);
            setImages((prev) => [
              ...prev,
              { url: previewUrl, name: file.name },
            ]);
          }
        } else {
          // Local/Demo Preview fallback
          const previewUrl = URL.createObjectURL(file);
          setImages((prev) => [
            ...prev,
            { url: previewUrl, name: file.name },
          ]);
        }
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      setError("Failed to upload photo. Please check your connection.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

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
          imageUrls: images.map((i) => i.url),
          imagePublicIds: images.map((i) => i.publicId).filter(Boolean),
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
        setError(json.error?.message || "Failed to submit review.");
      }
    } catch {
      setError("Network connection issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card bg-white rounded-card w-full max-w-lg border border-sand-300 shadow-elevation-3 p-6 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-sand-200">
          <div>
            <span className="text-[11px] font-bold text-primary uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Diner Photo Review</span>
            </span>
            <h3 className="font-heading font-bold text-base text-stone-900 truncate mt-0.5">
              {productName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-sand-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="font-heading font-extrabold text-stone-900 text-lg">
              Review Submitted Successfully!
            </h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              Thank you for sharing your photos and feedback with our culinary team and fellow diners.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating Picker */}
            <div className="text-center py-2 space-y-2 bg-sand-50/70 p-4 rounded-xl border border-sand-200">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                How was your dining experience?
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
              <span className="text-xs font-semibold text-stone-700 block">
                {rating === 5 && "⭐ Exceptional! Highly Recommended"}
                {rating === 4 && "⭐ Very Good & Flavorful"}
                {rating === 3 && "⭐ Satisfactory"}
                {rating === 2 && "⭐ Needs Improvement"}
                {rating === 1 && "⭐ Unsatisfactory"}
              </span>
            </div>

            {/* Comments / Tasting Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tasting Notes & Feedback (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your impressions on the aroma, texture, spice harmony, or presentation..."
                className="w-full p-3 text-xs rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
              />
            </div>

            {/* Photo Upload Dropzone */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-primary" />
                  <span>Upload Food Photos ({images.length}/3)</span>
                </label>
                <span className="text-[10px] text-stone-500">Max 3 photos • JPG/PNG</span>
              </div>

              {/* Thumbnails list */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-sand-300 bg-sand-100 group shadow-xs"
                    >
                      <Image
                        src={img.url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors shadow-sm"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button / dropzone */}
              {images.length < 3 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="photo-review-upload"
                  />
                  <label
                    htmlFor="photo-review-upload"
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-sand-300 hover:border-primary rounded-xl cursor-pointer bg-sand-50/50 hover:bg-sand-100/60 transition-all text-center space-y-1"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary py-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading photo...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-stone-400 group-hover:text-primary" />
                        <span className="text-xs font-bold text-stone-700">
                          Click to select dish photos
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Show the plating and culinary presentation
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-sand-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold rounded-button bg-sand-100 hover:bg-sand-200 text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-5 py-2.5 text-xs font-bold rounded-button bg-primary hover:bg-primary-hover text-white shadow-sm disabled:opacity-60 flex items-center gap-1.5 transition-all"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Review</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
