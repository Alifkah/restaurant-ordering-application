"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShieldCheck, Camera, X, MessageSquareQuote } from "lucide-react";

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  customerName?: string | null;
  imageUrls?: string[] | null;
  createdAt: string | Date;
}

interface ProductReviewListProps {
  reviews: ReviewItem[];
  productName: string;
}

export default function ProductReviewList({ reviews, productName }: ProductReviewListProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Extract all photos across all reviews for photo gallery strip
  const allPhotos: Array<{ url: string; customerName?: string | null; rating: number }> = [];
  reviews.forEach((rev) => {
    if (rev.imageUrls && rev.imageUrls.length > 0) {
      rev.imageUrls.forEach((url) => {
        allPhotos.push({
          url,
          customerName: rev.customerName,
          rating: rev.rating,
        });
      });
    }
  });

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-6">
      {/* 1. Review Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-sand-300 shadow-elevation-1">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-400/30 flex flex-col items-center justify-center text-stone-900">
            <span className="font-heading font-extrabold text-2xl text-amber-600 leading-none">
              {averageRating}
            </span>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-2.5 h-2.5 ${
                    s <= Math.round(Number(averageRating))
                      ? "text-amber-500 fill-amber-500"
                      : "text-stone-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading font-bold text-base text-stone-900">
              Verified Diner Ratings
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Based on {reviews.length} authentic {reviews.length === 1 ? "review" : "reviews"} from verified dining experiences
            </p>
          </div>
        </div>

        {allPhotos.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-100 text-stone-700 text-xs font-bold border border-sand-300">
            <Camera className="w-4 h-4 text-primary" />
            <span>{allPhotos.length} Food Photos</span>
          </div>
        )}
      </div>

      {/* 2. Customer Photo Gallery Strip */}
      {allPhotos.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-primary" />
            <span>Customer Food Photo Gallery ({allPhotos.length})</span>
          </h4>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {allPhotos.map((photo, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => setLightboxImage(photo.url)}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-sand-100 border border-sand-300 flex-shrink-0 group hover:scale-[1.03] transition-transform focus:outline-none shadow-xs"
              >
                <Image
                  src={photo.url}
                  alt={`Diner photo ${pIdx + 1}`}
                  fill
                  className="object-cover group-hover:brightness-95 transition-all"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                  <span>View</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Review Cards List */}
      {reviews.length > 0 ? (
        <div className="space-y-3.5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-sand-300 shadow-xs space-y-3 hover:border-sand-400 transition-colors"
            >
              {/* Header: User & Rating */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                    {rev.customerName?.charAt(0) || "D"}
                  </div>
                  <div>
                    <span className="font-heading font-bold text-xs sm:text-sm text-stone-900 block">
                      {rev.customerName || "Verified Guest"}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Dine-In Order</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-stone-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              {rev.comment && (
                <p className="text-xs text-stone-700 leading-relaxed bg-sand-50/80 p-3 rounded-xl border border-sand-200">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              )}

              {/* Attached Photos */}
              {rev.imageUrls && rev.imageUrls.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  {rev.imageUrls.map((imgUrl, iIdx) => (
                    <button
                      key={iIdx}
                      type="button"
                      onClick={() => setLightboxImage(imgUrl)}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-sand-300 bg-sand-100 hover:opacity-90 transition-opacity shadow-xs"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Attachment ${iIdx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Date */}
              <div className="text-right">
                <span className="text-[10px] text-stone-400">
                  {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-sand-50 border border-sand-300 text-center space-y-2">
          <MessageSquareQuote className="w-8 h-8 text-stone-400 mx-auto" />
          <h4 className="font-heading font-bold text-sm text-stone-800">
            No Tasting Reviews Yet
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            Be the first guest to order and review {productName}!
          </p>
        </div>
      )}

      {/* 4. Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-3xl max-h-[85vh] w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage}
              alt="Diner photo preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
