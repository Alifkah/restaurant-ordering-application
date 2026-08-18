/**
 * Cloudinary Media Helper
 * Optimizes food imagery with automatic WebP/AVIF format selection,
 * smart cropping, and responsive quality transforms.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "thumb" | "scale" | "fit" | "limit";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
}

/**
 * Generate an optimized Cloudinary delivery URL
 */
export function getOptimizedImageUrl(
  imagePathOrUrl: string | null | undefined,
  options: CloudinaryTransformOptions = {}
): string {
  if (!imagePathOrUrl) {
    // Default fallback placeholder
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80";
  }

  // If already a full URL that is NOT Cloudinary (e.g. Unsplash), return as is or append unsplash params
  if (imagePathOrUrl.startsWith("http://") || imagePathOrUrl.startsWith("https://")) {
    if (!imagePathOrUrl.includes("res.cloudinary.com")) {
      return imagePathOrUrl;
    }
  }

  const {
    width = 800,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    `c_${crop}`,
    width ? `w_${width}` : "",
    height ? `h_${height}` : "",
  ]
    .filter(Boolean)
    .join(",");

  // Extract public ID if full Cloudinary URL was provided
  let cleanPublicId = imagePathOrUrl;
  if (imagePathOrUrl.includes("res.cloudinary.com")) {
    const parts = imagePathOrUrl.split("/upload/");
    if (parts[1]) {
      // Remove any existing transforms in the URL
      const afterUpload = parts[1].replace(/^v\d+\//, "");
      cleanPublicId = afterUpload;
    }
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${cleanPublicId}`;
}
